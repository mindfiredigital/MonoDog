/**
 * Authentication Middleware
 * Handles session validation and permission checks
 */

import { Request, Response, NextFunction } from 'express';
import type { AuthSession } from '../types/auth';
import { AppLogger } from './logger';
import { AUTH_ERRORS, PERMISSION_ERRORS } from '../constants/error-messages';
import {
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_FORBIDDEN,
} from '../constants/http';
import { chars, sessionTimeout } from '../constants';

const sessionStore = new Map<string, AuthSession>();

function decodeLegacySessionToken(token: string): AuthSession | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

    if (!decoded?.token || !decoded?.login || !decoded?.userId) {
      return null;
    }

    return {
      accessToken: decoded.token,
      expiresIn: 3600,
      expiresAt: decoded.issuedAt
        ? decoded.issuedAt + sessionTimeout
        : Date.now() + sessionTimeout,
      user: {
        id: decoded.userId,
        login: decoded.login,
        name: null,
        email: null,
        avatar_url: '',
        html_url: '',
        bio: null,
        public_repos: 0,
        followers: 0,
        following: 0,
      },
      scopes: ['user:email', 'read:user', 'repo'],
      permission: decoded.permission
        ? {
            userId: decoded.userId,
            username: decoded.login,
            owner: decoded.permission.owner || '',
            repo: decoded.permission.repo || '',
            permission: decoded.permission.level || 'read',
            role: decoded.permission.role || 'Denied',
            cachedAt: decoded.issuedAt || Date.now(),
            ttl: sessionTimeout,
          }
        : null,
    };
  } catch {
    return null;
  }
}

/**
 * Generate session token
 */
export function generateSessionToken(length: number = 32): string {
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Store session
 */
export function storeSession(session: AuthSession): string {
  const token = generateSessionToken();
  sessionStore.set(token, session);

  // Set expiration timeout
  setTimeout(() => {
    sessionStore.delete(token);
    AppLogger.debug(`Session expired: ${session.user.login}`);
  }, sessionTimeout);

  AppLogger.debug(`Session stored for user: ${session.user.login}`);
  return token;
}

/**
 * Get session by token
 */
export function getSession(token: string): AuthSession | null {
  const session = sessionStore.get(token);
  if (!session) {
    return decodeLegacySessionToken(token);
  }

  // Check if session has expired based on expiresAt
  if (Date.now() > session.expiresAt) {
    sessionStore.delete(token);
    AppLogger.warn(`Session token expired: ${token.substring(0, 10)}...`);
    return null;
  }

  return session;
}

/**
 * Invalidate session
 */
export function invalidateSession(token: string): void {
  sessionStore.delete(token);
  AppLogger.debug(`Session invalidated: ${token.substring(0, 10)}...`);
}

/**
 * Middleware to verify authentication
 */
export function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token =
    req.headers.authorization?.replace('Bearer ', '') ||
    req.cookies?.['auth-token'];

  if (!token) {
    AppLogger.warn(`Unauthorized request to ${req.path}: no auth token`);
    res.status(HTTP_STATUS_UNAUTHORIZED).json({
      error: AUTH_ERRORS.UNAUTHORIZED,
      message: AUTH_ERRORS.TOKEN_REQUIRED,
    });
    return;
  }

  const session = getSession(token);

  if (!session) {
    AppLogger.warn(`Unauthorized request to ${req.path}: invalid session`);
    res.status(HTTP_STATUS_UNAUTHORIZED).json({
      error: AUTH_ERRORS.UNAUTHORIZED,
      message: AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION,
    });
    return;
  }

  // Attach session and user info to request
  (req as any).session = session;
  (req as any).user = {
    login: session.user.login,
    id: session.user.id,
  };
  (req as any).accessToken = session.accessToken;

  // Attach permission from session (if available)
  if (session.permission) {
    (req as any).permission = session.permission;
  } else {
    // Default to 'read' if no permission fetched
    (req as any).permission = {
      permission: 'read',
      role: 'Denied',
      userId: session.user.id,
      username: session.user.login,
      owner: '',
      repo: '',
      cachedAt: Date.now(),
      ttl: 0,
    };
  }

  AppLogger.debug(
    `Authenticated request from user: ${session.user.login} with permission: ${(req as any).permission?.permission || 'unknown'}`
  );
  next();
}

/**
 * Middleware to verify repository permission
 */
export function repositoryPermissionMiddleware(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as any;
    const session = authReq.session as AuthSession | undefined;

    if (!session) {
      res.status(HTTP_STATUS_UNAUTHORIZED).json({
        error: AUTH_ERRORS.UNAUTHORIZED,
        message: AUTH_ERRORS.SESSION_NOT_FOUND,
      });
      return;
    }

    const permission = authReq.permission;

    if (!permission) {
      res.status(HTTP_STATUS_FORBIDDEN).json({
        error: PERMISSION_ERRORS.FORBIDDEN,
        message: PERMISSION_ERRORS.PERMISSION_NOT_RESOLVED,
      });
      return;
    }

    const permissionHierarchy: Record<string, number> = {
      admin: 4,
      maintain: 3,
      write: 2,
      read: 1,
      none: 0,
    };

    // Handle both string and object formats for permission
    const userPermissionString =
      typeof permission === 'string'
        ? permission
        : permission.permission || 'none';
    const userLevel = permissionHierarchy[userPermissionString] || 0;
    const requiredLevel = permissionHierarchy[requiredPermission] || 0;

    if (userLevel < requiredLevel) {
      AppLogger.warn(
        `User ${session.user.login} lacks permission for action requiring ${requiredPermission} (has ${userPermissionString})`
      );
      res.status(HTTP_STATUS_FORBIDDEN).json({
        error: PERMISSION_ERRORS.FORBIDDEN,
        message: PERMISSION_ERRORS.INSUFFICIENT_PERMISSION(requiredPermission),
      });
      return;
    }

    next();
  };
}

/**
 * Get session from request
 */
export function getSessionFromRequest(req: Request): AuthSession | null {
  return (req as any).session || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(req: Request): boolean {
  return !!getSessionFromRequest(req);
}

/**
 * Clear expired sessions (should be called periodically)
 */
export function clearExpiredSessions(): void {
  const now = Date.now();
  let clearedCount = 0;

  for (const [token, session] of sessionStore.entries()) {
    if (now > session.expiresAt) {
      sessionStore.delete(token);
      clearedCount++;
    }
  }

  if (clearedCount > 0) {
    AppLogger.debug(`Cleared ${clearedCount} expired sessions`);
  }
}

/**
 * Get session statistics
 */
export function getSessionStats(): {
  activeSessions: number;
  maxSessions: number;
} {
  return {
    activeSessions: sessionStore.size,
    maxSessions: 10000,
  };
}

/**
 * Initialize authentication (call on server startup)
 */
export function initializeAuthentication(): void {
  // Periodically clear expired sessions
  setInterval(() => {
    clearExpiredSessions();
  }, 60 * 1000); // Every minute

  AppLogger.info('Authentication system initialized');
}
