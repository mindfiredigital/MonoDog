/**
 * Authentication Service Tests
 * Tests for OAuth flow, session management, and authentication business logic
 */

import {
  initiateLogin,
  handleOAuthCallback,
  getCurrentSession,
  validateCurrentSession,
  logoutUser,
  refreshUserSession,
} from '../src/services/auth-service';
import * as githubOAuthService from '../src/services/github-oauth-service';
import * as authMiddleware from '../src/middleware/auth-middleware';
import * as permissionService from '../src/services/permission-service';
import * as utilities from '../src/utils/utilities';
import { AppLogger } from '../src/middleware/logger';
import { Request } from 'express';

// Mock dependencies
jest.mock('../src/services/github-oauth-service');
jest.mock('../src/middleware/auth-middleware');
jest.mock('../src/services/permission-service');
jest.mock('../src/utils/utilities');
jest.mock('../src/middleware/logger', () => ({
  AppLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Authentication Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_CLIENT_ID = 'test-client-id';
    process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
    process.env.OAUTH_REDIRECT_URI = 'http://localhost/auth/callback';
  });

  describe('initiateLogin', () => {
    it('should generate OAuth authorization URL with state', () => {
      (githubOAuthService.generateAuthorizationUrl as jest.Mock).mockReturnValue(
        'https://github.com/login/oauth/authorize?client_id=test&state=state123'
      );

      const result = initiateLogin();

      expect(result).toHaveProperty('authUrl');
      expect(result).toHaveProperty('state');
      expect(result.authUrl).toContain('github.com/login/oauth/authorize');
      expect(githubOAuthService.generateAuthorizationUrl).toHaveBeenCalledWith(
        'test-client-id',
        'http://localhost/auth/callback',
        expect.any(String)
      );
    });

    it('should use custom redirect URL when provided', () => {
      (githubOAuthService.generateAuthorizationUrl as jest.Mock).mockReturnValue(
        'https://github.com/login/oauth/authorize?client_id=test'
      );

      const redirectUrl = '/dashboard';
      initiateLogin(redirectUrl);

      // State is stored with the redirect URL internally
      expect(githubOAuthService.generateAuthorizationUrl).toHaveBeenCalled();
    });

    it('should throw error if GITHUB_CLIENT_ID is not set', () => {
      delete process.env.GITHUB_CLIENT_ID;

      expect(() => initiateLogin()).toThrow('Failed to initiate GitHub OAuth flow');
    });

    it('should generate different state values for multiple calls', () => {
      (githubOAuthService.generateAuthorizationUrl as jest.Mock).mockReturnValue(
        'https://github.com/login/oauth/authorize?client_id=test'
      );

      const result1 = initiateLogin();
      const result2 = initiateLogin();

      expect(result1.state).not.toBe(result2.state);
    });
  });

  describe('handleOAuthCallback', () => {
    const mockCode = 'test-code-123';
    const mockState = 'test-state-123';

    beforeEach(() => {
      (githubOAuthService.exchangeCodeForToken as jest.Mock).mockResolvedValue({
        access_token: 'test-access-token',
        scope: 'read:user,user:email,repo',
        token_type: 'bearer',
      });

      (githubOAuthService.getAuthenticatedUser as jest.Mock).mockResolvedValue({
        id: 12345,
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://avatars.githubusercontent.com/u/12345',
      });

      (authMiddleware.storeSession as jest.Mock).mockReturnValue('session-token-123');
    });

    it('should successfully handle OAuth callback and create session', async () => {
      // First initiate a login to get a valid state
      (githubOAuthService.generateAuthorizationUrl as jest.Mock).mockReturnValue(
        'https://github.com/login/oauth/authorize'
      );
      const loginResult = initiateLogin();

      (utilities.getRepositoryInfoFromGit as jest.Mock).mockResolvedValue(null);

      const result = await handleOAuthCallback(mockCode, loginResult.state);

      expect(result).toHaveProperty('sessionToken');
      expect(result).toHaveProperty('user');
      expect(result.user.login).toBe('testuser');
      expect(authMiddleware.storeSession).toHaveBeenCalled();
    });

    it('should fetch repository permission if repo info available', async () => {
      (githubOAuthService.generateAuthorizationUrl as jest.Mock).mockReturnValue(
        'https://github.com/login/oauth/authorize'
      );
      const loginResult = initiateLogin();

      (utilities.getRepositoryInfoFromGit as jest.Mock).mockResolvedValue({
        owner: 'test-owner',
        repo: 'test-repo',
      });

      (permissionService.getUserRepositoryPermission as jest.Mock).mockResolvedValue({
        permission: 'write',
        role: 'Collaborator',
        owner: 'test-owner',
        repo: 'test-repo',
      });

      const result = await handleOAuthCallback(mockCode, loginResult.state);

      expect(permissionService.getUserRepositoryPermission).toHaveBeenCalledWith(
        'test-access-token',
        12345,
        'testuser',
        'test-owner',
        'test-repo'
      );
      expect(result.permission?.level).toBe('write');
    });

    it('should continue without permission if fetch fails', async () => {
      (githubOAuthService.generateAuthorizationUrl as jest.Mock).mockReturnValue(
        'https://github.com/login/oauth/authorize'
      );
      const loginResult = initiateLogin();

      (utilities.getRepositoryInfoFromGit as jest.Mock).mockResolvedValue({
        owner: 'test-owner',
        repo: 'test-repo',
      });

      (permissionService.getUserRepositoryPermission as jest.Mock).mockRejectedValue(
        new Error('Permission fetch failed')
      );

      const result = await handleOAuthCallback(mockCode, loginResult.state);

      expect(result).toHaveProperty('sessionToken');
      expect(result.permission).toBeNull();
      expect(AppLogger.error).toHaveBeenCalled();
    });

    it('should throw error for missing code', async () => {
      (githubOAuthService.generateAuthorizationUrl as jest.Mock).mockReturnValue(
        'https://github.com/login/oauth/authorize'
      );
      const loginResult = initiateLogin();

      await expect(
        handleOAuthCallback('', loginResult.state)
      ).rejects.toThrow('OAuth code and state are required');
    });

    it('should throw error for missing state', async () => {
      await expect(
        handleOAuthCallback(mockCode, '')
      ).rejects.toThrow('OAuth code and state are required');
    });

    it('should throw error for invalid state', async () => {
      await expect(
        handleOAuthCallback(mockCode, 'invalid-state-123')
      ).rejects.toThrow('Invalid or expired session');
    });

    it('should throw error if GITHUB_CLIENT_SECRET is not set', async () => {
      delete process.env.GITHUB_CLIENT_SECRET;

      (githubOAuthService.generateAuthorizationUrl as jest.Mock).mockReturnValue(
        'https://github.com/login/oauth/authorize'
      );
      const loginResult = initiateLogin();

      await expect(
        handleOAuthCallback(mockCode, loginResult.state)
      ).rejects.toThrow('Failed to initiate GitHub OAuth flow');
    });
  });

  describe('getCurrentSession', () => {
    it('should return current session from authenticated request', () => {
      const mockSession = {
        user: {
          id: 12345,
          login: 'testuser',
          name: 'Test User',
          avatar_url: 'https://avatars.githubusercontent.com/u/12345',
        },
        scopes: ['read:user', 'user:email', 'repo'],
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        accessToken: 'test-token',
        expiresIn: 3600,
        permission: {
          permission: 'write',
          role: 'Collaborator',
          owner: 'test-owner',
          repo: 'test-repo',
        },
      };

      const mockRequest = {} as Request;
      (authMiddleware.getSessionFromRequest as jest.Mock).mockReturnValue(mockSession);

      const result = getCurrentSession(mockRequest);

      expect(result.user).toEqual(mockSession.user);
      expect(result.scopes).toEqual(mockSession.scopes);
      expect(result.expiresAt).toBe(mockSession.expiresAt);
    });

    it('should transform permission field correctly', () => {
      const mockSession = {
        user: { id: 1, login: 'test' },
        scopes: [],
        expiresAt: Date.now(),
        accessToken: 'token',
        expiresIn: 3600,
        permission: {
          permission: 'admin',
          role: 'Admin',
          owner: 'owner',
          repo: 'repo',
        },
      };

      const mockRequest = {} as Request;
      (authMiddleware.getSessionFromRequest as jest.Mock).mockReturnValue(mockSession);

      const result = getCurrentSession(mockRequest);

      expect(result.permission?.level).toBe('Admin');
      expect(result.permission?.owner).toBe('owner');
    });

    it('should throw error if no session found', () => {
      const mockRequest = {} as Request;
      (authMiddleware.getSessionFromRequest as jest.Mock).mockReturnValue(null);

      expect(() => getCurrentSession(mockRequest)).toThrow('Session not found');
    });
  });

  describe('validateCurrentSession', () => {
    it('should return valid session', async () => {
      const mockSession = {
        user: { id: 1, login: 'test' },
        scopes: [],
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        accessToken: 'valid-token',
        expiresIn: 3600,
      };

      const mockRequest = {} as Request;
      (authMiddleware.getSessionFromRequest as jest.Mock).mockReturnValue(mockSession);
      (githubOAuthService.validateToken as jest.Mock).mockResolvedValue(true);

      const result = await validateCurrentSession(mockRequest);

      expect(result.valid).toBe(true);
      expect(result.expiresAt).toBe(mockSession.expiresAt);
    });

    it('should invalidate expired session', async () => {
      const mockSession = {
        user: { id: 1, login: 'test' },
        scopes: [],
        expiresAt: Date.now(),
        accessToken: 'invalid-token',
        expiresIn: 3600,
      };

      const mockRequest = {
        headers: { authorization: 'Bearer test-token' },
      } as any;
      (authMiddleware.getSessionFromRequest as jest.Mock).mockReturnValue(mockSession);
      (githubOAuthService.validateToken as jest.Mock).mockResolvedValue(false);

      await expect(validateCurrentSession(mockRequest)).rejects.toThrow(
        'Invalid or expired session'
      );
      expect(authMiddleware.invalidateSession).toHaveBeenCalled();
    });

    it('should throw error if no session found', async () => {
      const mockRequest = {} as Request;
      (authMiddleware.getSessionFromRequest as jest.Mock).mockReturnValue(null);

      await expect(validateCurrentSession(mockRequest)).rejects.toThrow(
        'Session not found'
      );
    });
  });

  describe('logoutUser', () => {
    it('should invalidate session on logout', () => {
      const mockRequest = {
        headers: { authorization: 'Bearer test-token' },
      } as any;

      logoutUser(mockRequest);

      expect(authMiddleware.invalidateSession).toHaveBeenCalledWith('test-token');
    });

    it('should extract token from cookies if auth header not present', () => {
      const mockRequest = {
        headers: {},
        cookies: { 'auth-token': 'cookie-token' },
      } as any;

      logoutUser(mockRequest);

      expect(authMiddleware.invalidateSession).toHaveBeenCalledWith('cookie-token');
    });

    it('should not crash if no token found', () => {
      const mockRequest = {
        headers: {},
        cookies: {},
      } as any;

      expect(() => logoutUser(mockRequest)).not.toThrow();
    });
  });

  describe('refreshUserSession', () => {
    it('should refresh session and return new token', async () => {
      const currentExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
      const mockSession = {
        user: { id: 1, login: 'test' },
        scopes: ['read:user'],
        expiresAt: currentExpiresAt,
        accessToken: 'valid-token',
        expiresIn: 3600,
      };

      const mockRequest = {
        headers: { authorization: 'Bearer old-token' },
      } as any;

      (authMiddleware.getSessionFromRequest as jest.Mock).mockReturnValue(mockSession);
      (githubOAuthService.validateToken as jest.Mock).mockResolvedValue(true);
      (authMiddleware.storeSession as jest.Mock).mockReturnValue('new-session-token');

      const result = await refreshUserSession(mockRequest);

      expect(result).toHaveProperty('sessionToken');
      expect(result.sessionToken).toBe('new-session-token');
      expect(result.expiresAt).toBeGreaterThan(currentExpiresAt);
      expect(authMiddleware.storeSession).toHaveBeenCalled();
      expect(authMiddleware.invalidateSession).toHaveBeenCalledWith('old-token');
    });

    it('should throw error if token is no longer valid', async () => {
      const mockSession = {
        user: { id: 1, login: 'test' },
        scopes: [],
        expiresAt: Date.now(),
        accessToken: 'expired-token',
        expiresIn: 3600,
      };

      const mockRequest = {} as Request;
      (authMiddleware.getSessionFromRequest as jest.Mock).mockReturnValue(mockSession);
      (githubOAuthService.validateToken as jest.Mock).mockResolvedValue(false);

      await expect(refreshUserSession(mockRequest)).rejects.toThrow(
        'Invalid or expired session'
      );
    });

    it('should throw error if no session found', async () => {
      const mockRequest = {
        headers: {},
        cookies: {},
      } as any;
      (authMiddleware.getSessionFromRequest as jest.Mock).mockReturnValue(null);

      await expect(refreshUserSession(mockRequest)).rejects.toThrow(
        'Session not found'
      );
    });

    it('should extend session expiry by 24 hours', async () => {
      const beforeRefresh = Date.now();
      const mockSession = {
        user: { id: 1, login: 'test' },
        scopes: [],
        expiresAt: beforeRefresh,
        accessToken: 'valid-token',
        expiresIn: 3600,
      };

      const mockRequest = {
        headers: {},
        cookies: {},
      } as any;
      (authMiddleware.getSessionFromRequest as jest.Mock).mockReturnValue(mockSession);
      (githubOAuthService.validateToken as jest.Mock).mockResolvedValue(true);
      (authMiddleware.storeSession as jest.Mock).mockReturnValue('new-token');

      const result = await refreshUserSession(mockRequest);

      const expectedExpiry = beforeRefresh + 24 * 60 * 60 * 1000;
      expect(result.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - 1000); // Allow 1s margin
      expect(result.expiresAt).toBeLessThanOrEqual(expectedExpiry + 1000); // Allow 1s margin
    });
  });
});
