/**
 * Authentication Controller Tests
 * Tests for auth endpoints: login, callback, me, validate, logout, refresh
 */

import { Request, Response } from 'express';
import {
  login,
  callback,
  me,
  validate,
  logout,
  refresh,
} from '../src/controllers/auth-controller';
import * as authService from '../src/services/auth-service';
import { AppLogger } from '../src/middleware/logger';

// Mock dependencies
jest.mock('../src/services/auth-service');
jest.mock('../src/middleware/auth-middleware');
jest.mock('../src/middleware/logger', () => ({
  AppLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Authentication Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock response
    responseData = {};
    mockResponse = {
      json: jest.fn((data) => {
        responseData = data;
        return mockResponse;
      }),
      status: jest.fn(function (code) {
        this.statusCode = code;
        return this;
      }),
    };

    mockRequest = {
      query: {},
      headers: {},
      cookies: {},
    };
  });

  describe('login endpoint', () => {
    it('should initiate login and return auth URL', () => {
      const mockAuthUrl = 'https://github.com/login/oauth/authorize?client_id=test';
      const mockState = 'state-123';

      (authService.initiateLogin as jest.Mock).mockReturnValue({
        authUrl: mockAuthUrl,
        state: mockState,
      });

      login(mockRequest as Request, mockResponse as Response);

      expect(authService.initiateLogin).toHaveBeenCalledWith('/');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        authUrl: mockAuthUrl,
        message: expect.any(String),
      });
    });

    it('should use custom redirect URL from query param', () => {
      mockRequest.query = { redirect: '/dashboard' };

      (authService.initiateLogin as jest.Mock).mockReturnValue({
        authUrl: 'https://github.com/login/oauth/authorize',
        state: 'state-123',
      });

      login(mockRequest as Request, mockResponse as Response);

      expect(authService.initiateLogin).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle login initiation errors', () => {
      (authService.initiateLogin as jest.Mock).mockImplementation(() => {
        throw new Error('LOGIN_INITIATION_FAILED');
      });

      login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
      });
    });
  });

  describe('callback endpoint', () => {
    it('should handle successful OAuth callback', async () => {
      mockRequest.query = {
        code: 'test-code',
        state: 'test-state',
      };

      const mockResult = {
        sessionToken: 'session-token-123',
        redirectUrl: '/dashboard',
        user: {
          id: 1,
          login: 'testuser',
          name: 'Test User',
          avatar_url: 'https://avatars.githubusercontent.com/u/1',
        },
        permission: {
          level: 'write',
          role: 'Collaborator',
          owner: 'test-owner',
          repo: 'test-repo',
        },
      };

      (authService.handleOAuthCallback as jest.Mock).mockResolvedValue(mockResult);

      await callback(mockRequest as Request, mockResponse as Response);

      expect(authService.handleOAuthCallback).toHaveBeenCalledWith(
        'test-code',
        'test-state'
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        ...mockResult,
      });
    });

    it('should handle GitHub OAuth errors', async () => {
      mockRequest.query = {
        error: 'access_denied',
        error_description: 'User denied access',
      };

      await callback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'access_denied',
        message: 'User denied access',
      });
    });

    it('should handle missing code or state', async () => {
      mockRequest.query = { code: 'test-code' };

      await callback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing parameters',
        message: 'OAuth code and state are required',
      });
    });

    it('should handle CSRF validation errors', async () => {
      mockRequest.query = {
        code: 'test-code',
        state: 'invalid-state',
      };

      (authService.handleOAuthCallback as jest.Mock).mockRejectedValue(
        new Error('CSRF state validation failed')
      );

      await callback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid state',
        message: 'CSRF state validation failed',
      });
    });

    it('should handle OAuth exchange errors', async () => {
      mockRequest.query = {
        code: 'bad-code',
        state: 'test-state',
      };

      (authService.handleOAuthCallback as jest.Mock).mockRejectedValue(
        new Error('OAuth exchange failed: invalid_code')
      );

      await callback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
      });
    });
  });

  describe('me endpoint', () => {
    it('should return current user session', () => {
      const mockSession = {
        user: {
          id: 1,
          login: 'testuser',
          name: 'Test User',
          avatar_url: 'https://avatars.githubusercontent.com/u/1',
        },
        scopes: ['read:user', 'user:email', 'repo'],
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        permission: {
          level: 'write',
          owner: 'test-owner',
          repo: 'test-repo',
        },
      };

      (authService.getCurrentSession as jest.Mock).mockReturnValue(mockSession);

      me(mockRequest as Request, mockResponse as Response);

      expect(authService.getCurrentSession).toHaveBeenCalledWith(mockRequest);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        ...mockSession,
      });
    });

    it('should return 401 when session not found', () => {
      (authService.getCurrentSession as jest.Mock).mockImplementation(() => {
        throw new Error('SESSION_NOT_FOUND');
      });

      me(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
      });
    });
  });

  describe('validate endpoint', () => {
    it('should validate active session', async () => {
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

      (authService.validateCurrentSession as jest.Mock).mockResolvedValue({
        valid: true,
        expiresAt,
      });

      await validate(mockRequest as Request, mockResponse as Response);

      expect(authService.validateCurrentSession).toHaveBeenCalledWith(mockRequest);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        valid: true,
        expiresAt,
        message: expect.any(String),
      });
    });

    it('should return invalid for expired session', async () => {
      (authService.validateCurrentSession as jest.Mock).mockRejectedValue(
        new Error('Token is no longer valid')
      );

      await validate(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        valid: false,
        error: expect.any(String),
        message: expect.any(String),
      });
    });

    it('should handle validation errors gracefully', async () => {
      (authService.validateCurrentSession as jest.Mock).mockRejectedValue(
        new Error('Session_not_found')
      );

      await validate(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        valid: false,
        error: expect.any(String),
        message: expect.any(String),
      });
    });
  });

  describe('logout endpoint', () => {
    it('should logout user successfully', () => {
      (authService.logoutUser as jest.Mock).mockReturnValue(undefined);

      logout(mockRequest as Request, mockResponse as Response);

      expect(authService.logoutUser).toHaveBeenCalledWith(mockRequest);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
      });
    });

    it('should handle logout errors', () => {
      (authService.logoutUser as jest.Mock).mockImplementation(() => {
        throw new Error('Logout failed');
      });

      logout(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
      });
    });
  });

  describe('refresh endpoint', () => {
    it('should refresh session token successfully', async () => {
      const newExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

      (authService.refreshUserSession as jest.Mock).mockResolvedValue({
        sessionToken: 'new-session-token',
        expiresAt: newExpiresAt,
      });

      await refresh(mockRequest as Request, mockResponse as Response);

      expect(authService.refreshUserSession).toHaveBeenCalledWith(mockRequest);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        sessionToken: 'new-session-token',
        expiresAt: newExpiresAt,
      });
    });

    it('should return 401 for expired session', async () => {
      (authService.refreshUserSession as jest.Mock).mockRejectedValue(
        new Error('Token is no longer valid')
      );

      await refresh(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
      });
    });

    it('should handle refresh errors gracefully', async () => {
      (authService.refreshUserSession as jest.Mock).mockRejectedValue(
        new Error('Session not found')
      );

      await refresh(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
      });
    });
  });
});
