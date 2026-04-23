import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSystemInfo,
  getStats,
} from '../../src/controllers/system.controller';
import * as systemService from '../../src/services/system.service';

vi.mock('../../src/services/system.service', () => ({
  getSystemInformation: vi.fn(),
  getMonorepoStats: vi.fn(),
}));

describe('System Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {};
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('getSystemInfo', () => {
    it('should return system info successfully', () => {
      const mockInfo = { nodeVersion: 'v18.0.0', platform: 'linux' };
      vi.mocked(systemService.getSystemInformation).mockReturnValue(
        mockInfo as any
      );

      getSystemInfo(req as any, res as any);

      expect(systemService.getSystemInformation).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockInfo);
    });

    it('should handle errors when fetching system info', () => {
      vi.mocked(systemService.getSystemInformation).mockImplementation(() => {
        throw new Error('Test error');
      });

      getSystemInfo(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch system information',
      });
    });
  });

  describe('getStats', () => {
    it('should return monorepo stats successfully', async () => {
      const mockStats = { totalPackages: 10 };
      vi.mocked(systemService.getMonorepoStats).mockResolvedValue(
        mockStats as any
      );

      await getStats(req as any, res as any);

      expect(systemService.getMonorepoStats).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it('should handle errors when fetching stats', async () => {
      vi.mocked(systemService.getMonorepoStats).mockRejectedValue(
        new Error('Test error')
      );

      await getStats(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch statistics',
      });
    });
  });
});
