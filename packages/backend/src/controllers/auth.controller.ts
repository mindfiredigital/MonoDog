import { Request, Response } from 'express';
import {
  generateGithubAuthUrl,
  exchangeGithubCodeForToken,
  decodeSessionToken,
} from '../services/auth.service';

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
    const { code, state } = req.query;
    const cookieState = req.cookies?.oauth_state;

    const result = await exchangeGithubCodeForToken(
      code as string,
      state as string,
      cookieState as string
    );

    res.clearCookie('oauth_state');

    res.json({
      success: true,
      sessionToken: result.sessionToken,
      user: result.user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'OAuth callback failed',
    });
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
      scopes: ['user:email', 'read:user'],
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
