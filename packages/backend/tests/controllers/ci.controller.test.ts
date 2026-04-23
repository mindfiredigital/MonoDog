import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getMonorepoCIStatus,
  getPackageCIStatus,
} from '../../src/controllers/ci.controller';
import * as ciService from '../../src/services/ci-status.service';

vi.mock('../../src/services/ci-status.service', () => ({
  getMonorepoCIStatus: vi.fn(),
  getPackageCIStatus: vi.fn(),
}));

describe('CI Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = { params: {} };
    res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    vi.clearAllMocks();
  });

  describe('getMonorepoCIStatus', () => {
    it('should return the overall CI status', async () => {
      const mockStatus = { healthyPackages: 5 };
      vi.mocked(ciService.getMonorepoCIStatus).mockResolvedValue(
        mockStatus as any
      );

      await getMonorepoCIStatus(req, res);

      expect(ciService.getMonorepoCIStatus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockStatus);
    });
  });
});
