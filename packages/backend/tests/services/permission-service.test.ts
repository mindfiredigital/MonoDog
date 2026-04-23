import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserRepositoryPermission,
  invalidatePermissionCache,
  clearAllCache,
  getCacheStats,
} from '../../src/services/permission-service';
import * as githubOAuthService from '../../src/services/github-oauth-service';

vi.mock('../../src/services/github-oauth-service', () => ({
  getRepositoryPermission: vi.fn(),
  mapPermissionToRole: vi.fn().mockReturnValue('admin'),
}));

describe('Permission Service', () => {
  beforeEach(() => {
    clearAllCache();
    vi.clearAllMocks();
  });

  describe('getUserRepositoryPermission', () => {
    it('should query github API and cache the result', async () => {
      vi.mocked(githubOAuthService.getRepositoryPermission).mockResolvedValue({
        permission: 'admin',
      } as any);

      const result = await getUserRepositoryPermission(
        'token',
        1,
        'user',
        'owner',
        'repo'
      );

      expect(githubOAuthService.getRepositoryPermission).toHaveBeenCalledTimes(
        1
      );
      expect(result.permission).toBe('admin');
      expect(result.role).toBe('admin');

      // Second call should hit the cache
      const cachedResult = await getUserRepositoryPermission(
        'token',
        1,
        'user',
        'owner',
        'repo'
      );
      expect(githubOAuthService.getRepositoryPermission).toHaveBeenCalledTimes(
        1
      );
      expect(cachedResult).toEqual(result);
    });

    it('should fallback to none on API failure', async () => {
      vi.mocked(githubOAuthService.getRepositoryPermission).mockRejectedValue(
        new Error('API error')
      );

      const result = await getUserRepositoryPermission(
        'token',
        1,
        'user',
        'owner',
        'repo'
      );

      expect(result.permission).toBe('none');
    });
  });

  describe('Cache management', () => {
    it('should clear all cache', async () => {
      vi.mocked(githubOAuthService.getRepositoryPermission).mockResolvedValue({
        permission: 'admin',
      } as any);
      await getUserRepositoryPermission('token', 1, 'user', 'owner', 'repo');

      expect(getCacheStats().size).toBe(1);
      clearAllCache();
      expect(getCacheStats().size).toBe(0);
    });

    it('should invalidate specific permission cache', async () => {
      vi.mocked(githubOAuthService.getRepositoryPermission).mockResolvedValue({
        permission: 'admin',
      } as any);
      await getUserRepositoryPermission('token', 1, 'user', 'owner', 'repo');

      invalidatePermissionCache(1, 'owner', 'repo');
      expect(getCacheStats().size).toBe(0);
    });
  });
});
