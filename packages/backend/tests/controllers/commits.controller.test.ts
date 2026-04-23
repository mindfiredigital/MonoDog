import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCommits } from '../../src/controllers/commits.controller';
import * as commitsService from '../../src/services/commits.service';

vi.mock('../../src/services/commits.service', () => ({
  getPackageCommits: vi.fn(),
}));

describe('Commits Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = { query: {}, params: {} };
    res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    vi.clearAllMocks();
  });

  describe('getCommits', () => {
    it('should return recent commits', async () => {
      req.params.packagePath = 'core';
      const mockCommits = [{ hash: '123456', message: 'init' }];
      vi.mocked(commitsService.getPackageCommits).mockResolvedValue(
        mockCommits as any
      );

      await getCommits(req, res);

      expect(commitsService.getPackageCommits).toHaveBeenCalledWith('core');
      expect(res.json).toHaveBeenCalledWith(mockCommits);
    });

    it('should handle errors if getting commits fails', async () => {
      vi.mocked(commitsService.getPackageCommits).mockRejectedValue(
        new Error('Git error')
      );

      await getCommits(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });
});
