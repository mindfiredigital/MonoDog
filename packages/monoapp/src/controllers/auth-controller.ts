/**
 * Authentication Controller
 * Thin controller that handles HTTP concerns and delegates business logic to auth-service
 */

import { Request, Response } from 'express';
import {
  initiateLogin,
  handleOAuthCallback,
  getCurrentSession,
  validateCurrentSession,
  logoutUser,
  refreshUserSession,
} from '../services/auth-service';
import { getSessionFromRequest } from '../middleware/auth-middleware';
import { AppLogger } from '../middleware/logger';

/**
 * Start OAuth login flow
 * GET /auth/login
 */
export const login = (req: Request, res: Response) => {
  try {
    const redirectUrl = (req.query.redirect as string) || '/';
    const result = initiateLogin(redirectUrl);

    res.json({
      success: true,
      authUrl: result.authUrl,
      message: 'Redirect to this URL to authenticate with GitHub',
    });
  } catch (error) {
    AppLogger.error(`Login initiation failed: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error instanceof Error ? error.message : 'Failed to initiate GitHub OAuth flow',
    });
  }
};

/**
 * OAuth callback handler
 * GET /auth/callback?code=...&state=...
 */
export const callback = async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors from GitHub
    if (error) {
      AppLogger.warn(`OAuth error: ${error} - ${error_description}`);
      res.status(400).json({
        success: false,
        error: error as string,
        message: error_description as string,
      });
      return;
    }

    if (!code || !state) {
      AppLogger.warn('OAuth callback missing code or state');
      res.status(400).json({
        success: false,
        error: 'Missing parameters',
        message: 'OAuth code and state are required',
      });
      return;
    }

    const result = await handleOAuthCallback(code as string, state as string);

    res.json({
      success: true,
      message: 'Authentication successful',
      ...result,
    });
  } catch (error) {
    AppLogger.error(`OAuth callback failed: ${error}`);
    const message = error instanceof Error ? error.message : 'Failed to complete GitHub OAuth flow';

    if (message.includes('CSRF')) {
      res.status(400).json({
        success: false,
        error: 'Invalid state',
        message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Authentication failed',
        message,
      });
    }
  }
};

/**
 * Get current user session
 * GET /auth/me
 */
export const me = (req: Request, res: Response) => {
  try {
    const session = getCurrentSession(req);

    res.json({
      success: true,
      ...session,
    });
  } catch (error) {
    AppLogger.error(`Failed to get user session: ${error}`);
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Failed to retrieve user information',
    });
  }
};

/**
 * Validate session
 * POST /auth/validate
 */
export const validate = async (req: Request, res: Response) => {
  try {
    const result = await validateCurrentSession(req);

    res.json({
      success: true,
      ...result,
      message: 'Session is valid',
    });
  } catch (error) {
    AppLogger.error(`Session validation failed: ${error}`);

    if (error instanceof Error && error.message.includes('no longer valid')) {
      res.status(401).json({
        success: false,
        valid: false,
        error: 'Unauthorized',
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        valid: false,
        error: 'Validation failed',
        message: error instanceof Error ? error.message : 'Failed to validate session',
      });
    }
  }
};

/**
 * Logout
 * POST /auth/logout
 */
export const logout = (req: Request, res: Response) => {
  try {
    logoutUser(req);

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    AppLogger.error(`Logout failed: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: error instanceof Error ? error.message : 'Failed to logout',
    });
  }
};

/**
 * Refresh session (token)
 * POST /auth/refresh
 */
export const refresh = async (req: Request, res: Response) => {
  try {
    const result = await refreshUserSession(req);

    res.json({
      success: true,
      message: 'Session refreshed successfully',
      ...result,
    });
  } catch (error) {
    AppLogger.error(`Session refresh failed: ${error}`);

    if (error instanceof Error && error.message.includes('no longer valid')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Refresh failed',
        message: error instanceof Error ? error.message : 'Failed to refresh session',
      });
    }
  }
};
