import { describe, it, expect, vi } from 'vitest';
import { getRecentActivity } from '../../src/services/activity.service';

vi.mock('../../src/db/prisma', () => ({
  prisma: {
    activityLog: {
      findMany: vi.fn().mockImplementation(async ({ take }) => {
        const data = [
          { id: '1', type: 'test', packageName: 'pkg-a', timestamp: new Date('2023-01-03'), metadata: JSON.stringify({ version: '1.0.0', type: 'library' }) },
          { id: '2', type: 'test', packageName: 'pkg-b', timestamp: new Date('2023-01-02'), metadata: JSON.stringify({ version: '2.0.0', type: 'app' }) },
          { id: '3', type: 'test', packageName: 'pkg-c', timestamp: new Date('2023-01-01'), metadata: JSON.stringify({ version: '3.0.0', type: 'library' }) },
        ];
        return data.slice(0, take);
      }),
      count: vi.fn().mockResolvedValue(3)
    }
  }
}));

describe('Activity Service', () => {
  describe('getRecentActivity', () => {
    it('should return recent activities bounded by limit', async () => {
      const result = await getRecentActivity(2);

      expect(result.total).toBe(3);
      expect(result.activities.length).toBe(2);

      const firstActivity = result.activities[0];
      expect(firstActivity).toHaveProperty('id');
      expect(firstActivity).toHaveProperty('type');
      expect(firstActivity).toHaveProperty('packageName');
      expect(firstActivity).toHaveProperty('timestamp');
      expect(firstActivity).toHaveProperty('metadata');
    });

    it('should return all available activities if limit exceeds package count', async () => {
      const result = await getRecentActivity(10);

      expect(result.total).toBe(3);
      expect(result.activities.length).toBe(3);
    });

    it('should sort activities by timestamp descending', async () => {
      const result = await getRecentActivity(3);

      const time1 = result.activities[0].timestamp.getTime();
      const time2 = result.activities[1].timestamp.getTime();

      expect(time1).toBeGreaterThanOrEqual(time2);
    });
  });
});
