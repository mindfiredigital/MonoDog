"use strict";
/**
 * Authentication Routes
 * Handles GitHub OAuth and session management
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const github_oauth_service_1 = require("../services/github-oauth-service");
const auth_middleware_1 = require("../middleware/auth-middleware");
const permission_service_1 = require("../services/permission-service");
const logger_1 = require("../middleware/logger");
const utilities_1 = require("../utils/utilities");
const router = (0, express_1.Router)();
// OAuth configuration (should come from environment variables)
// const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
// const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
// const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback';
// State store for CSRF protection
const stateStore = new Map();
const STATE_EXPIRY = 10 * 60 * 1000; // 10 minutes
/**
 * Generate random state for CSRF protection
 */
function generateState() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
/**
 * Validate OAuth state
 */
function validateState(state) {
    const entry = stateStore.get(state);
    if (!entry) {
        return false;
    }
    // Check if state has expired
    if (Date.now() - entry.createdAt > STATE_EXPIRY) {
        stateStore.delete(state);
        return false;
    }
    return true;
}
/**
 * Get redirect URL from state
 */
function getRedirectUrl(state) {
    const entry = stateStore.get(state);
    return entry?.redirectUrl;
}
/**
 * Clear state after use
 */
function clearState(state) {
    stateStore.delete(state);
}
/**
 * Start OAuth login flow
 * GET /auth/login
 */
router.get('/login', (req, res) => {
    try {
        if (!process.env.GITHUB_CLIENT_ID) {
            logger_1.AppLogger.error('GitHub client ID not configured');
            res.status(500).json({
                error: 'OAuth not configured',
                message: 'GitHub OAuth is not properly configured',
            });
            return;
        }
        const state = generateState();
        const redirectUrl = req.query.redirect || '/';
        // Store state for validation
        stateStore.set(state, {
            createdAt: Date.now(),
            redirectUrl,
        });
        const authUrl = (0, github_oauth_service_1.generateAuthorizationUrl)(process.env.GITHUB_CLIENT_ID, process.env.OAUTH_REDIRECT_URI, state);
        res.json({
            success: true,
            authUrl,
            message: 'Redirect to this URL to authenticate with GitHub',
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Login initiation failed: ${error}`);
        res.status(500).json({
            error: 'Login failed',
            message: 'Failed to initiate GitHub OAuth flow',
        });
    }
});
/**
 * OAuth callback handler
 * GET /auth/callback?code=...&state=...
 */
router.get('/callback', async (req, res) => {
    try {
        const { code, state, error, error_description } = req.query;
        // Handle OAuth errors
        if (error) {
            logger_1.AppLogger.warn(`OAuth error: ${error} - ${error_description}`);
            res.status(400).json({
                success: false,
                error: error,
                message: error_description,
            });
            return;
        }
        // Validate code and state
        if (!code || !state) {
            logger_1.AppLogger.warn('OAuth callback missing code or state');
            res.status(400).json({
                success: false,
                error: 'Missing parameters',
                message: 'OAuth code and state are required',
            });
            return;
        }
        // Validate state for CSRF protection
        if (!validateState(state)) {
            logger_1.AppLogger.warn(`Invalid or expired state in OAuth callback: ${state}`);
            res.status(400).json({
                success: false,
                error: 'Invalid state',
                message: 'CSRF validation failed',
            });
            return;
        }
        if (!process.env.GITHUB_CLIENT_SECRET) {
            logger_1.AppLogger.error('GitHub client secret not configured');
            res.status(500).json({
                error: 'OAuth not configured',
                message: 'GitHub OAuth is not properly configured',
            });
            return;
        }
        // Exchange code for access token
        logger_1.AppLogger.debug('Exchanging OAuth code for access token');
        const tokenResponse = await (0, github_oauth_service_1.exchangeCodeForToken)(code, process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET, process.env.OAUTH_REDIRECT_URI);
        // Get user information
        logger_1.AppLogger.debug('Retrieving authenticated user information');
        const user = await (0, github_oauth_service_1.getAuthenticatedUser)(tokenResponse.access_token);
        // Fetch user's repository permission
        let permission = null;
        try {
            logger_1.AppLogger.debug(`Fetching repository permission for user ${user.login}`);
            // Extract repository info from git remote
            const repoInfo = await (0, utilities_1.getRepositoryInfoFromGit)();
            if (!repoInfo) {
                logger_1.AppLogger.warn('Could not extract repository info from git remote - permission fetch skipped');
            }
            else {
                const { owner, repo } = repoInfo;
                permission = await (0, permission_service_1.getUserRepositoryPermission)(tokenResponse.access_token, user.id, user.login, owner, repo);
                logger_1.AppLogger.info(`User ${user.login} has ${permission.permission} permission on ${owner}/${repo}`);
            }
        }
        catch (permError) {
            logger_1.AppLogger.error(`Failed to fetch repository permission: ${permError}`);
            // Continue without permission - will be checked on protected routes
            permission = null;
        }
        // Create session with permission
        const session = {
            accessToken: tokenResponse.access_token,
            expiresIn: 3600, // 1 hour default
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            user,
            scopes: tokenResponse.scope.split(','),
            permission, // Include fetched permission in session
        };
        // Store session and get token
        const sessionToken = (0, auth_middleware_1.storeSession)(session);
        // Get redirect URL
        const redirectUrl = getRedirectUrl(state) || '/';
        // Clear state
        clearState(state);
        logger_1.AppLogger.info(`User authenticated: ${user.login} with permission: ${permission?.permission || 'unknown'}`);
        res.json({
            success: true,
            message: 'Authentication successful',
            sessionToken,
            redirectUrl,
            user: {
                id: user.id,
                login: user.login,
                name: user.name,
                avatar_url: user.avatar_url,
            },
            permission: permission ? {
                level: permission.permission,
                role: permission.role,
                owner: permission.owner,
                repo: permission.repo,
            } : null,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`OAuth callback failed: ${error}`);
        res.status(500).json({
            success: false,
            error: 'Authentication failed',
            message: 'Failed to complete GitHub OAuth flow',
        });
    }
});
/**
 * Get current user session
 * GET /auth/me
 */
router.get('/me', auth_middleware_1.authenticationMiddleware, (req, res) => {
    try {
        const session = (0, auth_middleware_1.getSessionFromRequest)(req);
        if (!session) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'No active session',
            });
            return;
        }
        res.json({
            success: true,
            user: {
                id: session.user.id,
                login: session.user.login,
                name: session.user.name,
                email: session.user.email,
                avatar_url: session.user.avatar_url,
                public_repos: session.user.public_repos,
                followers: session.user.followers,
                following: session.user.following,
            },
            scopes: session.scopes,
            expiresAt: session.expiresAt,
            permission: session.permission || null,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to get user session: ${error}`);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve user information',
        });
    }
});
/**
 * Validate session
 * POST /auth/validate
 */
router.post('/validate', auth_middleware_1.authenticationMiddleware, async (req, res) => {
    try {
        const session = (0, auth_middleware_1.getSessionFromRequest)(req);
        if (!session) {
            res.status(401).json({
                success: false,
                valid: false,
                message: 'No active session',
            });
            return;
        }
        // Validate token with GitHub
        const isValid = await (0, github_oauth_service_1.validateToken)(session.accessToken);
        if (!isValid) {
            // Token is no longer valid, invalidate session
            const token = req.headers.authorization?.replace('Bearer ', '') ||
                req.cookies?.['auth-token'];
            if (token) {
                (0, auth_middleware_1.invalidateSession)(token);
            }
            res.status(401).json({
                success: false,
                valid: false,
                message: 'Session token is no longer valid',
            });
            return;
        }
        res.json({
            success: true,
            valid: true,
            message: 'Session is valid',
            expiresAt: session.expiresAt,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Session validation failed: ${error}`);
        res.status(500).json({
            success: false,
            valid: false,
            error: 'Validation failed',
            message: 'Failed to validate session',
        });
    }
});
/**
 * Logout
 * POST /auth/logout
 */
router.post('/logout', auth_middleware_1.authenticationMiddleware, (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') ||
            req.cookies?.['auth-token'];
        if (token) {
            (0, auth_middleware_1.invalidateSession)(token);
        }
        res.json({
            success: true,
            message: 'Logout successful',
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Logout failed: ${error}`);
        res.status(500).json({
            success: false,
            error: 'Logout failed',
            message: 'Failed to logout',
        });
    }
});
/**
 * Refresh session (token)
 * POST /auth/refresh
 */
router.post('/refresh', auth_middleware_1.authenticationMiddleware, async (req, res) => {
    try {
        const session = (0, auth_middleware_1.getSessionFromRequest)(req);
        if (!session) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No active session',
            });
            return;
        }
        // Validate token is still valid
        const isValid = await (0, github_oauth_service_1.validateToken)(session.accessToken);
        if (!isValid) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Token is no longer valid with GitHub',
            });
            return;
        }
        // Create new session with updated expiry
        const newSession = {
            ...session,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Extend 24 hours
        };
        const newToken = (0, auth_middleware_1.storeSession)(newSession);
        // Invalidate old token
        const oldToken = req.headers.authorization?.replace('Bearer ', '') ||
            req.cookies?.['auth-token'];
        if (oldToken) {
            (0, auth_middleware_1.invalidateSession)(oldToken);
        }
        res.json({
            success: true,
            message: 'Session refreshed successfully',
            sessionToken: newToken,
            expiresAt: newSession.expiresAt,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Session refresh failed: ${error}`);
        res.status(500).json({
            success: false,
            error: 'Refresh failed',
            message: 'Failed to refresh session',
        });
    }
});
exports.default = router;
