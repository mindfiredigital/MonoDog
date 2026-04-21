import { describe, it, expect, vi } from 'vitest';
import {
  getSystemInformation,
  getMonorepoStats,
} from '../../src/services/system.service';

vi.mock('@monodog/utils/helpers', () => ({
  scanMonorepo: vi.fn(() => []),
  generateMonorepoStats: vi.fn(() => ({
    totalPackages: 5,
    totalDependencies: 20,
  })),
}));

describe('System Service', () => {
  describe('getSystemInformation', () => {
    it('should return basic system information', () => {
      const info = getSystemInformation();

      expect(info).toHaveProperty('nodeVersion');
      expect(info.platform).toBeDefined();
      expect(info.arch).toBeDefined();
      expect(info.memory).toHaveProperty('heapUsed');
      expect(info.uptime).toBeGreaterThanOrEqual(0);
      expect(info.pid).toBeGreaterThan(0);
      expect(info.cwd).toBeDefined();
      expect(info.env).toHaveProperty('NODE_ENV');
    });
  });

  describe('getMonorepoStats', () => {
    it('should calculate and return monorepo statistics', async () => {
      const stats = await getMonorepoStats();

      expect(stats.totalPackages).toBe(5);
      expect(stats.totalDependencies).toBe(20);
      expect(stats.timestamp).toBeGreaterThan(0);
      expect(stats.scanDuration).toBe(0);
    });
  });
});
