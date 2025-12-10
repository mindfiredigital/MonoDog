/**
 * Tests for dependency graph utility functions
 */

import {
  getStatusColor,
  getTypeColor,
  getDependencyStatusColor,
  calculateGraphStats,
} from '../src/components/modules/dependency-graph/utils/dependency.utils';

describe('Dependency Graph Utils', () => {
  describe('getStatusColor', () => {
    it('should return green for healthy status', () => {
      const color = getStatusColor('healthy');
      expect(color).toBe('text-green-600 bg-green-100');
    });

    it('should return yellow for warning status', () => {
      const color = getStatusColor('warning');
      expect(color).toBe('text-yellow-600 bg-yellow-100');
    });

    it('should return red for error status', () => {
      const color = getStatusColor('error');
      expect(color).toBe('text-red-600 bg-red-100');
    });

    it('should return gray for unknown status', () => {
      const color = getStatusColor('unknown');
      expect(color).toBe('text-gray-600 bg-gray-100');
    });
  });

  describe('getTypeColor', () => {
    it('should return blue for app type', () => {
      const color = getTypeColor('app');
      expect(color).toBe('text-blue-600 bg-blue-100');
    });

    it('should return purple for lib type', () => {
      const color = getTypeColor('lib');
      expect(color).toBe('text-purple-600 bg-purple-100');
    });

    it('should return orange for tool type', () => {
      const color = getTypeColor('tool');
      expect(color).toBe('text-orange-600 bg-orange-100');
    });

    it('should return gray for unknown type', () => {
      const color = getTypeColor('unknown');
      expect(color).toBe('text-gray-600 bg-gray-100');
    });
  });

  describe('getDependencyStatusColor', () => {
    it('should return color for healthy dependency', () => {
      const packages = [
        { name: 'dep-1', status: 'healthy', type: 'lib', dependencies: [] } as any,
      ];

      const color = getDependencyStatusColor('dep-1', packages);
      expect(color).toBe('text-green-500');
    });

    it('should return color for warning dependency', () => {
      const packages = [
        { name: 'dep-1', status: 'warning', type: 'lib', dependencies: [] } as any,
      ];

      const color = getDependencyStatusColor('dep-1', packages);
      expect(color).toBe('text-yellow-500');
    });

    it('should return color for error dependency', () => {
      const packages = [
        { name: 'dep-1', status: 'error', type: 'lib', dependencies: [] } as any,
      ];

      const color = getDependencyStatusColor('dep-1', packages);
      expect(color).toBe('text-red-500');
    });

    it('should return gray for missing dependency', () => {
      const packages = [] as any;

      const color = getDependencyStatusColor('missing-dep', packages);
      expect(color).toBe('text-gray-400');
    });
  });

  describe('calculateGraphStats', () => {
    it('should calculate stats for empty graph', () => {
      const stats = calculateGraphStats([]);
      expect(stats.totalPackages).toBe(0);
      expect(stats.totalDependencies).toBe(0);
      expect(stats.avgDependencies).toBe(0);
    });

    it('should calculate graph statistics', () => {
      const packages = [
        { name: 'pkg-1', dependencies: ['dep-1', 'dep-2'], dependents: [], status: 'healthy', type: 'lib' } as any,
        { name: 'pkg-2', dependencies: ['dep-1'], dependents: ['pkg-1'], status: 'healthy', type: 'lib' } as any,
        { name: 'pkg-3', dependencies: [], dependents: [], status: 'healthy', type: 'lib' } as any,
      ];

      const stats = calculateGraphStats(packages);
      expect(stats.totalPackages).toBe(3);
      expect(stats.totalDependencies).toBe(3);
      expect(stats.avgDependencies).toBe(1);
    });

    it('should handle packages with different dependency counts', () => {
      const packages = [
        { name: 'pkg-1', dependencies: ['dep-1', 'dep-2', 'dep-3'], dependents: [], status: 'healthy', type: 'lib' } as any,
        { name: 'pkg-2', dependencies: [], dependents: ['pkg-1'], status: 'healthy', type: 'lib' } as any,
      ];

      const stats = calculateGraphStats(packages);
      expect(stats.totalPackages).toBe(2);
      expect(stats.totalDependencies).toBe(3);
    });
  });
});
