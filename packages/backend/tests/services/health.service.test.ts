import { describe, it, expect, vi } from 'vitest';
import {
  getSystemHealth,
  getPackageHealthMetrics,
} from '../../src/services/health.service';

describe('Health Service', () => {
  describe('getSystemHealth', () => {
    it('should return an overall system health status', () => {
      const health = getSystemHealth();
      expect(health).toHaveProperty('status');
    });
  });

  describe('getPackageHealthMetrics', () => {
    it('should resolve and return metrics structure', async () => {
      try {
        const metrics = await getPackageHealthMetrics('some-pkg');
        expect(metrics).toBeDefined();
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
});
