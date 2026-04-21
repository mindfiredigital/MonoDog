import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateGithubAuthUrl,
  decodeSessionToken,
} from '../../src/services/auth.service';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateGithubAuthUrl', () => {
    it('should generate an auth URL and state', () => {
      const result = generateGithubAuthUrl();

      expect(result).toHaveProperty('authUrl');
      expect(result).toHaveProperty('state');
      expect(result.authUrl).toContain(
        'https://github.com/login/oauth/authorize'
      );
      expect(result.authUrl).toContain('state=');
    });
  });

  describe('decodeSessionToken', () => {
    it('should decode a base64 encoded JSON token', () => {
      const payload = { userId: 123, login: 'testuser' };
      const token = Buffer.from(JSON.stringify(payload)).toString('base64');

      const decoded = decodeSessionToken(token);
      expect(decoded).toEqual(payload);
    });
  });
});
