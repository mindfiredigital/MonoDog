/**
 * Authentication Routes
 * Handles GitHub OAuth and session management
 */

import express, { Request, Response, Router } from 'express';
import { URLSearchParams } from 'url';
import type { AuthSession, AuthResponse } from '../types/auth';
import {
  exchangeCodeForToken,
  generateAuthorizationUrl,
  getAuthenticatedUser,
  validateToken,
} from '../services/github-oauth-service';
import {
  storeSession,
  getSession,
  invalidateSession,
  authenticationMiddleware,
  getSessionFromRequest,
} from '../middleware/auth-middleware';
import { getUserRepositoryPermission, startCacheCleanup } from '../services/permission-service';
import { AppLogger } from '../middleware/logger';
import { getRepositoryInfoFromGit } from '../utils/utilities';

const router = Router();

// OAuth configuration (should come from environment variables)
// const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
// const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
// const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback';

// State store for CSRF protection
const stateStore = new Map<string, { createdAt: number; redirectUrl?: string }>();
const STATE_EXPIRY = 10 * 60 * 1000; // 10 minutes

/**
 * Generate random state for CSRF protection
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Validate OAuth state
 */
function validateState(state: string): boolean {
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
function getRedirectUrl(state: string): string | undefined {
  const entry = stateStore.get(state);
  return entry?.redirectUrl;
}

/**
 * Clear state after use
 */
function clearState(state: string): void {
  stateStore.delete(state);
}

/**
 * Start OAuth login flow
 * GET /auth/login
 */
router.get('/login', (req: Request, res: Response) => {
  try {
    if (!process.env.GITHUB_CLIENT_ID) {
      AppLogger.error('GitHub client ID not configured');
      res.status(500).json({
        error: 'OAuth not configured',
        message: 'GitHub OAuth is not properly configured',
      });
      return;
    }

    const state = generateState();
    const redirectUrl = (req.query.redirect as string) || '/';

    // Store state for validation
    stateStore.set(state, {
      createdAt: Date.now(),
      redirectUrl,
    });

    const authUrl = generateAuthorizationUrl(
      process.env.GITHUB_CLIENT_ID,
      process.env.OAUTH_REDIRECT_URI as string,
      state
    );

    res.json({
      success: true,
      authUrl,
      message: 'Redirect to this URL to authenticate with GitHub',
    });
  } catch (error) {
    AppLogger.error(`Login initiation failed: ${error}`);
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
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors
    if (error) {
      AppLogger.warn(`OAuth error: ${error} - ${error_description}`);
      res.status(400).json({
        success: false,
        error: error as string,
        message: error_description as string,
      });
      return;
    }

    // Validate code and state
    if (!code || !state) {
      AppLogger.warn('OAuth callback missing code or state');
      res.status(400).json({
        success: false,
        error: 'Missing parameters',
        message: 'OAuth code and state are required',
      });
      return;
    }

    // Validate state for CSRF protection
    if (!validateState(state as string)) {
      AppLogger.warn(`Invalid or expired state in OAuth callback: ${state}`);
      res.status(400).json({
        success: false,
        error: 'Invalid state',
        message: 'CSRF validation failed',
      });
      return;
    }

    if (!process.env.GITHUB_CLIENT_SECRET) {
      AppLogger.error('GitHub client secret not configured');
      res.status(500).json({
        error: 'OAuth not configured',
        message: 'GitHub OAuth is not properly configured',
      });
      return;
    }

    // Exchange code for access token
    AppLogger.debug('Exchanging OAuth code for access token');
    const tokenResponse = await exchangeCodeForToken(
      code as string,
      process.env.GITHUB_CLIENT_ID as string,
      process.env.GITHUB_CLIENT_SECRET as string,
      process.env.OAUTH_REDIRECT_URI as string
    );

    // Get user information
    AppLogger.debug('Retrieving authenticated user information');
    const user = await getAuthenticatedUser(tokenResponse.access_token);

    // Fetch user's repository permission
    let permission = null;
    try {
      AppLogger.debug(`Fetching repository permission for user ${user.login}`);

      // Extract repository info from git remote
      const repoInfo = await getRepositoryInfoFromGit();

      if (!repoInfo) {
        AppLogger.warn('Could not extract repository info from git remote - permission fetch skipped');
      } else {
        const { owner, repo } = repoInfo;
        permission = await getUserRepositoryPermission(
          tokenResponse.access_token,
          user.id,
          user.login,
          owner,
          repo
        );
        AppLogger.info(`User ${user.login} has ${permission.permission} permission on ${owner}/${repo}`);
      }
    } catch (permError) {
      AppLogger.error(`Failed to fetch repository permission: ${permError}`);
      // Continue without permission - will be checked on protected routes
      permission = null;
    }

    // Create session with permission
    const session: AuthSession = {
      accessToken: tokenResponse.access_token,
      expiresIn: 3600, // 1 hour default
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      user,
      scopes: tokenResponse.scope.split(','),
      permission, // Include fetched permission in session
    };

    // Store session and get token
    const sessionToken = storeSession(session);

    // Get redirect URL
    const redirectUrl = getRedirectUrl(state as string) || '/';

    // Clear state
    clearState(state as string);

    AppLogger.info(`User authenticated: ${user.login} with permission: ${permission?.permission || 'unknown'}`);

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
  } catch (error) {
    AppLogger.error(`OAuth callback failed: ${error}`);
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
router.get('/me', authenticationMiddleware, (req: Request, res: Response) => {
  try {
    const session = getSessionFromRequest(req);
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
  } catch (error) {
    AppLogger.error(`Failed to get user session: ${error}`);
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
router.post(
  '/validate',
  authenticationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);

      if (!session) {
        res.status(401).json({
          success: false,
          valid: false,
          message: 'No active session',
        });
        return;
      }

      // Validate token with GitHub
      const isValid = await validateToken(session.accessToken);

      if (!isValid) {
        // Token is no longer valid, invalidate session
        const token =
          req.headers.authorization?.replace('Bearer ', '') ||
          req.cookies?.['auth-token'];

        if (token) {
          invalidateSession(token);
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
    } catch (error) {
      AppLogger.error(`Session validation failed: ${error}`);
      res.status(500).json({
        success: false,
        valid: false,
        error: 'Validation failed',
        message: 'Failed to validate session',
      });
    }
  }
);

/**
 * Logout
 * POST /auth/logout
 */
router.post('/logout', authenticationMiddleware, (req: Request, res: Response) => {
  try {
    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies?.['auth-token'];

    if (token) {
      invalidateSession(token);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    AppLogger.error(`Logout failed: ${error}`);
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
router.post(
  '/refresh',
  authenticationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);

      if (!session) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'No active session',
        });
        return;
      }

      // Validate token is still valid
      const isValid = await validateToken(session.accessToken);

      if (!isValid) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Token is no longer valid with GitHub',
        });
        return;
      }

      // Create new session with updated expiry
      const newSession: AuthSession = {
        ...session,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Extend 24 hours
      };

      const newToken = storeSession(newSession);

      // Invalidate old token
      const oldToken =
        req.headers.authorization?.replace('Bearer ', '') ||
        req.cookies?.['auth-token'];

      if (oldToken) {
        invalidateSession(oldToken);
      }

      res.json({
        success: true,
        message: 'Session refreshed successfully',
        sessionToken: newToken,
        expiresAt: newSession.expiresAt,
      });
    } catch (error) {
      AppLogger.error(`Session refresh failed: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Refresh failed',
        message: 'Failed to refresh session',
      });
    }
  }
);

export default router;
