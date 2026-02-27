"use strict";
/**
 * Authentication Service
 * Handles all authentication business logic including OAuth flow, session management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateLogin = initiateLogin;
exports.handleOAuthCallback = handleOAuthCallback;
exports.getCurrentSession = getCurrentSession;
exports.validateCurrentSession = validateCurrentSession;
exports.logoutUser = logoutUser;
exports.refreshUserSession = refreshUserSession;
const github_oauth_service_1 = require("./github-oauth-service");
const auth_middleware_1 = require("../middleware/auth-middleware");
const permission_service_1 = require("./permission-service");
const logger_1 = require("../middleware/logger");
const utilities_1 = require("../utils/utilities");
const features_1 = require("../constants/features");
const error_messages_1 = require("../constants/error-messages");
// State store for CSRF protection
const stateStore = new Map();
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
    if (Date.now() - entry.createdAt > features_1.STATE_EXPIRY) {
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
 * Initiate login by generating authorization URL
 * @param redirectUrl - Where to redirect after login
 * @returns Login URL response with state
 */
function initiateLogin(redirectUrl = '/') {
    if (!process.env.GITHUB_CLIENT_ID) {
        throw new Error(error_messages_1.AUTH_ERRORS.LOGIN_INITIATION_FAILED);
    }
    const state = generateState();
    // Store state for validation
    stateStore.set(state, {
        createdAt: Date.now(),
        redirectUrl,
    });
    const authUrl = (0, github_oauth_service_1.generateAuthorizationUrl)(process.env.GITHUB_CLIENT_ID, process.env.OAUTH_REDIRECT_URI, state);
    return {
        authUrl,
        state,
    };
}
/**
 * Handle OAuth callback and create session
 * @param code - OAuth authorization code
 * @param state - CSRF protection state
 * @returns OAuth callback response with session token
 */
async function handleOAuthCallback(code, state) {
    // Validate code and state
    if (!code || !state) {
        throw new Error(error_messages_1.AUTH_ERRORS.MISSING_CODE_OR_STATE);
    }
    // Validate state for CSRF protection
    if (!validateState(state)) {
        throw new Error(error_messages_1.AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION);
    }
    if (!process.env.GITHUB_CLIENT_SECRET) {
        throw new Error(error_messages_1.AUTH_ERRORS.LOGIN_INITIATION_FAILED);
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
    return {
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
    };
}
/**
 * Get current user session from request
 * @param req - Express request
 * @returns Session response
 */
function getCurrentSession(req) {
    const session = (0, auth_middleware_1.getSessionFromRequest)(req);
    if (!session) {
        throw new Error(error_messages_1.AUTH_ERRORS.SESSION_NOT_FOUND);
    }
    // Transform CachedPermission to SessionResponse permission shape
    const permission = session.permission
        ? {
            level: session.permission.role || 'Denied',
            role: session.permission.role || 'Denied',
            owner: session.permission.owner,
            repo: session.permission.repo,
        }
        : null;
    return {
        user: session.user,
        scopes: session.scopes,
        expiresAt: session.expiresAt,
        permission,
    };
}
/**
 * Validate current session with GitHub
 * @param req - Express request
 * @returns Validation response
 */
async function validateCurrentSession(req) {
    const session = (0, auth_middleware_1.getSessionFromRequest)(req);
    if (!session) {
        throw new Error(error_messages_1.AUTH_ERRORS.SESSION_NOT_FOUND);
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
        throw new Error(error_messages_1.AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION);
    }
    return {
        valid: true,
        expiresAt: session.expiresAt,
    };
}
/**
 * Logout user by invalidating session
 * @param req - Express request
 */
function logoutUser(req) {
    const token = req.headers.authorization?.replace('Bearer ', '') ||
        req.cookies?.['auth-token'];
    if (token) {
        (0, auth_middleware_1.invalidateSession)(token);
    }
}
/**
 * Refresh session token
 * @param req - Express request
 * @returns New session token and expiry
 */
async function refreshUserSession(req) {
    const session = (0, auth_middleware_1.getSessionFromRequest)(req);
    if (!session) {
        throw new Error(error_messages_1.AUTH_ERRORS.SESSION_NOT_FOUND);
    }
    // Validate token is still valid
    const isValid = await (0, github_oauth_service_1.validateToken)(session.accessToken);
    if (!isValid) {
        throw new Error(error_messages_1.AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION);
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
    return {
        sessionToken: newToken,
        expiresAt: newSession.expiresAt,
    };
}
