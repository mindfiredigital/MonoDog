import { Request, Response } from 'express';
import {
  generateGithubAuthUrl,
  decodeSessionToken,
  handleOAuthCallback,
} from '../services/auth.service';
import {
  AUTH_ERRORS,
  AUTH_MESSAGES,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} from '../constants';

export const login = (req: Request, res: Response) => {
  try {
    const { authUrl, state } = generateGithubAuthUrl();

    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
    });

    res.json({
      success: true,
      authUrl,
      state,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate auth URL',
    });
  }
};

export const callback = async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors from GitHub
    if (error) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: error as string,
        message: error_description as string,
      });
      return;
    }

    if (!code || !state) {
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
    const message =
      error instanceof Error ? error.message : AUTH_ERRORS.GITHUB_OAUTH_FAILED;

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

export const getMe = (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
    }

    const decoded = decodeSessionToken(token);

    res.json({
      success: true,
      user: {
        id: decoded.userId,
        login: decoded.login,
      },
      scopes: ['user:email', 'read:user', 'repo'],
      expiresAt: decoded.issuedAt + 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};

export const validate = (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'No authorization token provided',
      });
    }

    decodeSessionToken(token);

    res.json({
      success: true,
      valid: true,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      error: 'Token validation failed',
    });
  }
};

export const logout = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
