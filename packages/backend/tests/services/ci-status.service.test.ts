import { describe, it, expect, vi } from 'vitest';
import {
  getMonorepoCIStatus,
  getPackageCIStatus,
} from '../../src/services/ci-status.service';

vi.mock('../../src/utils/utilities', () => ({
  getRepositoryInfoFromGit: vi
    .fn()
    .mockResolvedValue({ owner: 'test', repo: 'test-repo' }),
}));

vi.mock('../../src/services/github-actions-service', () => ({
  getWorkflowRuns: vi.fn().mockResolvedValue({ runs: [], totalCount: 0 }),
}));

describe('CI Status Service', () => {
  describe('getMonorepoCIStatus', () => {
    it('should fetch overall CI status', async () => {
      const status = await getMonorepoCIStatus('root/path', 'fake-token');
      expect(status.success).toBe(true);
      expect(status.pipelines).toEqual([]);
      expect(status.total).toBe(0);
    });
  });

  describe('getPackageCIStatus', () => {
    it('should return package CI status if found', async () => {
      const status = await getPackageCIStatus(
        'root/path',
        'core',
        'fake-token'
      );
      expect(status.success).toBe(true);
      expect(status.pipelines).toEqual([]);
    });
  });
});
