import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, getMe } from '../../src/controllers/auth.controller';
import * as authService from '../../src/services/auth.service';

vi.mock('../../src/services/auth.service', () => ({
  generateGithubAuthUrl: vi.fn(),
  decodeSessionToken: vi.fn(),
}));

describe('Auth Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
      cookie: vi.fn(),
    };
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return 200 with authUrl and state', () => {
      vi.mocked(authService.generateGithubAuthUrl).mockReturnValue({
        authUrl: 'http://gh',
        state: 'xyz',
      });
      login(req, res);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        authUrl: 'http://gh',
        state: 'xyz',
      });
    });
  });

  describe('getMe', () => {
    it('should return user info if authenticated', () => {
      req.headers.authorization = 'Bearer valid-token';
      vi.mocked(authService.decodeSessionToken).mockReturnValue({
        userId: 1,
        login: 'testuser',
        issuedAt: 12345,
      } as any);

      getMe(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: { id: 1, login: 'testuser' },
        scopes: ['user:email', 'read:user', 'repo'],
        expiresAt: 12345 + 24 * 60 * 60 * 1000,
      });
    });
  });
});
