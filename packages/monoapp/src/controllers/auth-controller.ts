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
import {
  AUTH_MESSAGES,
  AUTH_ERRORS,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_UNAUTHORIZED,
} from '../constants';

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
      message: AUTH_MESSAGES.LOGIN_INITIATED,
    });
  } catch (error) {
    AppLogger.error(`Login initiation failed: ${error}`);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: AUTH_ERRORS.LOGIN_FAILED,
      message: error instanceof Error ? error.message : AUTH_ERRORS.LOGIN_INITIATION_FAILED,
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
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: error as string,
        message: error_description as string,
      });
      return;
    }

    if (!code || !state) {
      AppLogger.warn('OAuth callback missing code or state');
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: AUTH_ERRORS.MISSING_PARAMETERS,
        message: AUTH_ERRORS.MISSING_CODE_OR_STATE,
      });
      return;
    }

    const result = await handleOAuthCallback(code as string, state as string);

    res.json({
      success: true,
      message: AUTH_MESSAGES.AUTHENTICATION_SUCCESSFUL,
      ...result,
    });
  } catch (error) {
    AppLogger.error(`OAuth callback failed: ${error}`);
    const message = error instanceof Error ? error.message : AUTH_ERRORS.GITHUB_OAUTH_FAILED;

    if (message.includes('CSRF')) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: AUTH_ERRORS.INVALID_STATE,
        message,
      });
    } else {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        error: AUTH_ERRORS.LOGIN_FAILED,
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
    res.status(HTTP_STATUS_UNAUTHORIZED).json({
      success: false,
      error: AUTH_ERRORS.TOKEN_REQUIRED,
      message: error instanceof Error ? error.message : AUTH_ERRORS.SESSION_NOT_FOUND,
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
      message: AUTH_MESSAGES.SESSION_VALID,
    });
  } catch (error) {
    AppLogger.error(`Session validation failed: ${error}`);

    if (error instanceof Error && error.message.includes('no longer valid')) {
      res.status(HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        valid: false,
        error: AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION,
        message: error.message,
      });
    } else {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        valid: false,
        error: AUTH_ERRORS.SESSION_NOT_FOUND,
        message: error instanceof Error ? error.message : AUTH_ERRORS.SESSION_NOT_FOUND,
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
      message: AUTH_MESSAGES.LOGOUT_SUCCESSFUL,
    });
  } catch (error) {
    AppLogger.error(`Logout failed: ${error}`);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: AUTH_ERRORS.LOGIN_FAILED,
      message: error instanceof Error ? error.message : AUTH_ERRORS.LOGIN_FAILED,
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
      message: AUTH_MESSAGES.SESSION_REFRESHED,
      ...result,
    });
  } catch (error) {
    AppLogger.error(`Session refresh failed: ${error}`);

    if (error instanceof Error && error.message.includes('no longer valid')) {
      res.status(HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        error: AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION,
        message: error.message,
      });
    } else {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        error: AUTH_ERRORS.SESSION_NOT_FOUND,
        message: error instanceof Error ? error.message : AUTH_ERRORS.SESSION_NOT_FOUND,
      });
    }
  }
};
