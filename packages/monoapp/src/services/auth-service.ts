/**
 * Authentication Service
 * Handles all authentication business logic including OAuth flow, session management
 */

import {
  exchangeCodeForToken,
  generateAuthorizationUrl,
  getAuthenticatedUser,
  validateToken,
} from './github-oauth-service';
import {
  storeSession,
  invalidateSession,
  getSessionFromRequest,
} from '../middleware/auth-middleware';
import { getUserRepositoryPermission } from './permission-service';
import { AppLogger } from '../middleware/logger';
import { getRepositoryInfoFromGit } from '../utils/utilities';
import type { AuthSession, GitHubUser } from '../types/auth';
import type {
  LoginUrlResponse,
  OAuthCallbackResponse,
  SessionResponse,
  ValidationResponse,
} from '../types/auth-service-dto';
import type { Request } from 'express';
import { STATE_EXPIRY } from '../constants/features';
import { AUTH_ERRORS } from '../constants/error-messages';

// State store for CSRF protection
const stateStore = new Map<string, { createdAt: number; redirectUrl?: string }>();

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
 * Initiate login by generating authorization URL
 * @param redirectUrl - Where to redirect after login
 * @returns Login URL response with state
 */
export function initiateLogin(redirectUrl: string = '/'): LoginUrlResponse {
  if (!process.env.GITHUB_CLIENT_ID) {
    throw new Error(AUTH_ERRORS.LOGIN_INITIATION_FAILED);
  }

  const state = generateState();

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
export async function handleOAuthCallback(
  code: string,
  state: string
): Promise<OAuthCallbackResponse> {
  // Validate code and state
  if (!code || !state) {
    throw new Error(AUTH_ERRORS.MISSING_CODE_OR_STATE);
  }

  // Validate state for CSRF protection
  if (!validateState(state)) {
    throw new Error(AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION);
  }

  if (!process.env.GITHUB_CLIENT_SECRET) {
    throw new Error(AUTH_ERRORS.LOGIN_INITIATION_FAILED);
  }

  // Exchange code for access token
  AppLogger.debug('Exchanging OAuth code for access token');
  const tokenResponse = await exchangeCodeForToken(
    code,
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
  const redirectUrl = getRedirectUrl(state) || '/';

  // Clear state
  clearState(state);

  AppLogger.info(`User authenticated: ${user.login} with permission: ${permission?.permission || 'unknown'}`);

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
export function getCurrentSession(req: Request): SessionResponse {
  const session = getSessionFromRequest(req);

  if (!session) {
    throw new Error(AUTH_ERRORS.SESSION_NOT_FOUND);
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
export async function validateCurrentSession(req: Request): Promise<ValidationResponse> {
  const session = getSessionFromRequest(req);

  if (!session) {
    throw new Error(AUTH_ERRORS.SESSION_NOT_FOUND);
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

    throw new Error(AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION);
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
export function logoutUser(req: Request): void {
  const token =
    req.headers.authorization?.replace('Bearer ', '') ||
    req.cookies?.['auth-token'];

  if (token) {
    invalidateSession(token);
  }
}

/**
 * Refresh session token
 * @param req - Express request
 * @returns New session token and expiry
 */
export async function refreshUserSession(
  req: Request
): Promise<{ sessionToken: string; expiresAt: number }> {
  const session = getSessionFromRequest(req);

  if (!session) {
    throw new Error(AUTH_ERRORS.SESSION_NOT_FOUND);
  }

  // Validate token is still valid
  const isValid = await validateToken(session.accessToken);

  if (!isValid) {
    throw new Error(AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION);
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

  return {
    sessionToken: newToken,
    expiresAt: newSession.expiresAt,
  };
}
