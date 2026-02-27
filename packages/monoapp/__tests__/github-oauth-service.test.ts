/**
 * GitHub OAuth Service Tests
 * Tests for GitHub OAuth operations: token exchange, user info, permissions, etc.
 */

import https from 'https';
import {
  exchangeCodeForToken,
  getAuthenticatedUser,
  getUserEmail,
  getRepositoryPermission,
  mapPermissionToRole,
  hasPermission,
  validateToken,
  generateAuthorizationUrl,
} from '../src/services/github-oauth-service';
import { AppLogger } from '../src/middleware/logger';

// Mock https module
jest.mock('https');
jest.mock('../src/middleware/logger', () => ({
  AppLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GitHub OAuth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange OAuth code for access token successfully', async () => {
      const mockResponse = {
        access_token: 'test-token-123',
        scope: 'read:user,user:email,repo',
        token_type: 'bearer',
      };

      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;
      let onErrorCallback: (error: Error) => void;

      // Setup mock for https.request
      (https.request as jest.Mock).mockImplementation((options, callback) => {
        // Capture callbacks
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          if (event === 'error') onErrorCallback = cb;
          return mockRequest;
        });

        // Mock response object
        const mockRes = {
          statusCode: 200,
          on: mockRequest.on,
        };

        // Call the callback with mock response
        setTimeout(() => {
          callback(mockRes);
          onDataCallback(JSON.stringify(mockResponse));
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      const result = await exchangeCodeForToken(
        'test-code',
        'test-client-id',
        'test-client-secret',
        'http://localhost/callback'
      );

      expect(result.access_token).toBe('test-token-123');
      expect(result.scope).toBe('read:user,user:email,repo');
      expect(result.token_type).toBe('bearer');
    });

    it('should handle OAuth exchange errors', async () => {
      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;

      (https.request as jest.Mock).mockImplementation((options, callback) => {
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          return mockRequest;
        });

        const mockRes = {
          statusCode: 400,
          on: mockRequest.on,
        };

        setTimeout(() => {
          callback(mockRes);
          onDataCallback(JSON.stringify({ error: 'invalid_code' }));
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      await expect(
        exchangeCodeForToken(
          'invalid-code',
          'test-client-id',
          'test-client-secret',
          'http://localhost/callback'
        )
      ).rejects.toThrow('GitHub API error');
    });

    it('should throw error if response contains error field', async () => {
      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;

      (https.request as jest.Mock).mockImplementation((options, callback) => {
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          return mockRequest;
        });

        const mockRes = {
          statusCode: 200,
          on: mockRequest.on,
        };

        setTimeout(() => {
          callback(mockRes);
          onDataCallback(JSON.stringify({ error: 'bad_verification_code' }));
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      await expect(
        exchangeCodeForToken(
          'bad-code',
          'test-client-id',
          'test-client-secret',
          'http://localhost/callback'
        )
      ).rejects.toThrow('OAuth exchange failed');
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should retrieve authenticated user info successfully', async () => {
      const mockUserData = {
        id: 12345,
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://avatars.githubusercontent.com/u/12345',
        email: 'test@example.com',
      };

      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;

      (https.request as jest.Mock).mockImplementation((options, callback) => {
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          return mockRequest;
        });

        const mockRes = {
          statusCode: 200,
          on: mockRequest.on,
        };

        setTimeout(() => {
          callback(mockRes);
          onDataCallback(JSON.stringify(mockUserData));
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      const user = await getAuthenticatedUser('test-token');

      expect(user.login).toBe('testuser');
      expect(user.id).toBe(12345);
      expect(user.name).toBe('Test User');
      expect(AppLogger.debug).toHaveBeenCalled();
    });

    it('should handle errors when retrieving user info', async () => {
      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;

      (https.request as jest.Mock).mockImplementation((options, callback) => {
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          return mockRequest;
        });

        const mockRes = {
          statusCode: 401,
          on: mockRequest.on,
        };

        setTimeout(() => {
          callback(mockRes);
          onDataCallback('Unauthorized');
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      await expect(getAuthenticatedUser('invalid-token')).rejects.toThrow();
      expect(AppLogger.error).toHaveBeenCalled();
    });
  });

  describe('getUserEmail', () => {
    it('should retrieve primary verified email', async () => {
      const mockEmails = [
        {
          email: 'secondary@example.com',
          primary: false,
          verified: true,
        },
        {
          email: 'primary@example.com',
          primary: true,
          verified: true,
        },
      ];

      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;

      (https.request as jest.Mock).mockImplementation((options, callback) => {
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          return mockRequest;
        });

        const mockRes = {
          statusCode: 200,
          on: mockRequest.on,
        };

        setTimeout(() => {
          callback(mockRes);
          onDataCallback(JSON.stringify(mockEmails));
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      const email = await getUserEmail('test-token');

      expect(email).toBe('primary@example.com');
    });

    it('should return null if no primary verified email exists', async () => {
      const mockEmails = [
        {
          email: 'notverified@example.com',
          primary: true,
          verified: false,
        },
      ];

      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;

      (https.request as jest.Mock).mockImplementation((options, callback) => {
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          return mockRequest;
        });

        const mockRes = {
          statusCode: 200,
          on: mockRequest.on,
        };

        setTimeout(() => {
          callback(mockRes);
          onDataCallback(JSON.stringify(mockEmails));
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      const email = await getUserEmail('test-token');

      expect(email).toBeNull();
    });

    it('should handle errors gracefully and return null', async () => {
      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;

      (https.request as jest.Mock).mockImplementation((options, callback) => {
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          return mockRequest;
        });

        const mockRes = {
          statusCode: 403,
          on: mockRequest.on,
        };

        setTimeout(() => {
          callback(mockRes);
          onDataCallback('Forbidden');
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      const email = await getUserEmail('test-token');

      expect(email).toBeNull();
      expect(AppLogger.warn).toHaveBeenCalled();
    });
  });

  describe('getRepositoryPermission', () => {
    it('should retrieve user repository permission', async () => {
      const mockPermission = {
        permission: 'write',
        role: 'Collaborator',
      };

      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;

      (https.request as jest.Mock).mockImplementation((options, callback) => {
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          return mockRequest;
        });

        const mockRes = {
          statusCode: 200,
          on: mockRequest.on,
        };

        setTimeout(() => {
          callback(mockRes);
          onDataCallback(JSON.stringify(mockPermission));
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      const permission = await getRepositoryPermission(
        'test-token',
        'owner',
        'repo',
        'username'
      );

      expect(permission.permission).toBe('write');
      expect(AppLogger.debug).toHaveBeenCalled();
    });

    it('should return none permission on error', async () => {
      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;

      (https.request as jest.Mock).mockImplementation((options, callback) => {
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          return mockRequest;
        });

        const mockRes = {
          statusCode: 404,
          on: mockRequest.on,
        };

        setTimeout(() => {
          callback(mockRes);
          onDataCallback('Not Found');
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      const permission = await getRepositoryPermission(
        'test-token',
        'owner',
        'repo',
        'username'
      );

      expect(permission.permission).toBe('none');
      expect(AppLogger.warn).toHaveBeenCalled();
    });
  });

  describe('mapPermissionToRole', () => {
    it('should map admin permission to Admin role', () => {
      expect(mapPermissionToRole('admin')).toBe('Admin');
    });

    it('should map maintain permission to Maintainer role', () => {
      expect(mapPermissionToRole('maintain')).toBe('Maintainer');
    });

    it('should map write permission to Collaborator role', () => {
      expect(mapPermissionToRole('write')).toBe('Collaborator');
    });

    it('should map read permission to Collaborator role', () => {
      expect(mapPermissionToRole('read')).toBe('Collaborator');
    });

    it('should map none permission to Denied role', () => {
      expect(mapPermissionToRole('none')).toBe('Denied');
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has equal or higher permission', () => {
      expect(hasPermission('admin', 'write')).toBe(true);
      expect(hasPermission('write', 'write')).toBe(true);
      expect(hasPermission('maintain', 'read')).toBe(true);
    });

    it('should return false when user has lower permission', () => {
      expect(hasPermission('read', 'write')).toBe(false);
      expect(hasPermission('write', 'admin')).toBe(false);
      expect(hasPermission('none', 'read')).toBe(false);
    });

    it('should handle all permission levels correctly', () => {
      const permissionHierarchy = {
        none: 0,
        read: 1,
        write: 2,
        maintain: 3,
        admin: 4,
      };

      Object.entries(permissionHierarchy).forEach(([userPerm, userLevel]) => {
        Object.entries(permissionHierarchy).forEach(([requiredPerm, requiredLevel]) => {
          const result = hasPermission(
            userPerm as any,
            requiredPerm as any
          );
          expect(result).toBe(userLevel >= requiredLevel);
        });
      });
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      const mockUserData = {
        id: 12345,
        login: 'testuser',
      };

      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;

      (https.request as jest.Mock).mockImplementation((options, callback) => {
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          return mockRequest;
        });

        const mockRes = {
          statusCode: 200,
          on: mockRequest.on,
        };

        setTimeout(() => {
          callback(mockRes);
          onDataCallback(JSON.stringify(mockUserData));
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      const isValid = await validateToken('test-token');

      expect(isValid).toBe(true);
    });

    it('should return false for invalid token', async () => {
      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      };

      let onDataCallback: (chunk: string) => void;
      let onEndCallback: () => void;

      (https.request as jest.Mock).mockImplementation((options, callback) => {
        mockRequest.on.mockImplementation((event, cb) => {
          if (event === 'data') onDataCallback = cb;
          if (event === 'end') onEndCallback = cb;
          return mockRequest;
        });

        const mockRes = {
          statusCode: 401,
          on: mockRequest.on,
        };

        setTimeout(() => {
          callback(mockRes);
          onDataCallback('Unauthorized');
          onEndCallback();
        }, 0);

        return mockRequest;
      });

      const isValid = await validateToken('invalid-token');

      expect(isValid).toBe(false);
      expect(AppLogger.warn).toHaveBeenCalled();
    });
  });

  describe('generateAuthorizationUrl', () => {
    it('should generate correct OAuth authorization URL', () => {
      const state = 'test-state-123';
      const clientId = 'test-client-id';
      const redirectUri = 'http://localhost/callback';

      const url = generateAuthorizationUrl(clientId, redirectUri, state);

      expect(url).toContain('https://github.com/login/oauth/authorize');
      expect(url).toContain(`client_id=${clientId}`);
      expect(url).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
      expect(url).toContain(`state=${state}`);
      expect(url).toContain('scope=read%3Auser%2Cuser%3Aemail%2Crepo');
    });

    it('should include custom scopes when provided', () => {
      const customScopes = ['repo:status', 'admin:repo_hook'];
      const url = generateAuthorizationUrl(
        'client-id',
        'http://localhost/callback',
        'state',
        customScopes
      );

      expect(url).toContain('repo%3Astatus');
      expect(url).toContain('admin%3Arepo_hook');
    });

    it('should include allow_signup parameter', () => {
      const url = generateAuthorizationUrl(
        'client-id',
        'http://localhost/callback',
        'state'
      );

      expect(url).toContain('allow_signup=true');
    });
  });
});
