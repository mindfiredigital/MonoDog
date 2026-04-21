import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getActivity } from '../../src/controllers/activity.controller';
import * as activityService from '../../src/services/activity.service';

vi.mock('../../src/services/activity.service', () => ({
  getRecentActivity: vi.fn(),
}));

describe('Activity Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { query: {} };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('getActivity', () => {
    it('should return recent activity successfully with default limit', async () => {
      const mockResult = { activities: [], total: 0 };
      vi.mocked(activityService.getRecentActivity).mockResolvedValue(
        mockResult
      );

      await getActivity(req as any, res as any);

      expect(activityService.getRecentActivity).toHaveBeenCalledWith(20);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return recent activity successfully with custom limit', async () => {
      req.query.limit = '5';
      const mockResult = { activities: [{ id: '1' }], total: 1 };
      vi.mocked(activityService.getRecentActivity).mockResolvedValue(
        mockResult as any
      );

      await getActivity(req as any, res as any);

      expect(activityService.getRecentActivity).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors when fetching activity', async () => {
      vi.mocked(activityService.getRecentActivity).mockRejectedValue(
        new Error('Test error')
      );

      await getActivity(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch recent activity',
      });
    });
  });
});
