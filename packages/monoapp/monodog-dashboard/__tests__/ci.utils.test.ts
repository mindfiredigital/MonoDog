/**
 * Tests for CI utility functions
 */

import {
  getStatusColor,
  getStageStatusColor,
  calculateBuildStats,
  filterBuilds,
  sortBuilds,
  formatDuration,
} from '../src/components/modules/ci-integration/utils/ci.utils';

describe('CI Utils', () => {
  describe('getStatusColor', () => {
    it('should return green for success status', () => {
      const color = getStatusColor('success');
      expect(color).toBe('bg-green-100 text-green-800');
    });

    it('should return green for active status', () => {
      const color = getStatusColor('active');
      expect(color).toBe('bg-green-100 text-green-800');
    });

    it('should return blue for running status', () => {
      const color = getStatusColor('running');
      expect(color).toBe('bg-blue-100 text-blue-800');
    });

    it('should return yellow for pending status', () => {
      const color = getStatusColor('pending');
      expect(color).toBe('bg-yellow-100 text-yellow-800');
    });

    it('should return red for failed status', () => {
      const color = getStatusColor('failed');
      expect(color).toBe('bg-red-100 text-red-800');
    });

    it('should return red for cancelled status', () => {
      const color = getStatusColor('cancelled');
      expect(color).toBe('bg-red-100 text-red-800');
    });

    it('should return gray for paused status', () => {
      const color = getStatusColor('paused');
      expect(color).toBe('bg-gray-100 text-gray-800');
    });

    it('should return gray for skipped status', () => {
      const color = getStatusColor('skipped');
      expect(color).toBe('bg-gray-100 text-gray-600');
    });

    it('should return default gray for unknown status', () => {
      const color = getStatusColor('unknown');
      expect(color).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getStageStatusColor', () => {
    it('should return colors for all stage statuses', () => {
      expect(getStageStatusColor('success')).toBe('bg-green-100 text-green-800');
      expect(getStageStatusColor('running')).toBe('bg-blue-100 text-blue-800');
      expect(getStageStatusColor('pending')).toBe('bg-gray-100 text-gray-800');
      expect(getStageStatusColor('failed')).toBe('bg-red-100 text-red-800');
      expect(getStageStatusColor('skipped')).toBe('bg-gray-100 text-gray-600');
    });
  });

  describe('calculateBuildStats', () => {
    it('should return zero stats for empty builds', () => {
      const stats = calculateBuildStats([]);
      expect(stats).toEqual({
        total: 0,
        successful: 0,
        failed: 0,
        running: 0,
        successRate: 0,
        avgDuration: 0,
      });
    });

    it('should calculate build statistics', () => {
      const builds = [
        { status: 'success', packageName: 'pkg-1', duration: 120 } as any,
        { status: 'success', packageName: 'pkg-1', duration: 100 } as any,
        { status: 'failed', packageName: 'pkg-1', duration: 80 } as any,
        { status: 'running', packageName: 'pkg-1', duration: undefined } as any,
      ];

      const stats = calculateBuildStats(builds);
      expect(stats.total).toBe(4);
      expect(stats.successful).toBe(2);
      expect(stats.failed).toBe(1);
      expect(stats.running).toBe(1);
      expect(stats.successRate).toBe(50);
      expect(stats.avgDuration).toBe(100); // (120 + 100 + 80) / 3 = 100
    });

    it('should calculate success rate correctly', () => {
      const builds = [
        { status: 'success', duration: 100 } as any,
        { status: 'success', duration: 100 } as any,
        { status: 'failed', duration: 100 } as any,
      ];

      const stats = calculateBuildStats(builds);
      expect(stats.successRate).toBe(67);
    });
  });

  // ... remaining tests unchanged but import paths adjusted
});
