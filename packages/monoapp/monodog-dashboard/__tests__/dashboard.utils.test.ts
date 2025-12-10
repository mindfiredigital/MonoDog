/**
 * Tests for dashboard utility functions
 */

import {
  calculatePackageStats,
  getUniquePackageTypes,
  filterPackages,
  getStatusColor,
  getTypeIcon,
} from '../src/components/main-dashboard/utils/dashboard.utils';

describe('Dashboard Utils', () => {
  describe('calculatePackageStats', () => {
    it('should calculate stats for empty array', () => {
      const stats = calculatePackageStats([]);
      expect(stats).toEqual({
        total: 0,
        apps: 0,
        libs: 0,
        tools: 0,
        custom: 0,
        totalDependencies: 0,
      });
    });

    it('should count packages by type', () => {
      const packages = [
        { name: 'app-1', type: 'app', description: 'test', dependencies: {}, peerDependencies: {}, devDependencies: {} } as any,
        { name: 'lib-1', type: 'lib', description: 'test', dependencies: {}, peerDependencies: {}, devDependencies: {} } as any,
        { name: 'tool-1', type: 'tool', description: 'test', dependencies: {}, peerDependencies: {}, devDependencies: {} } as any,
      ];

      const stats = calculatePackageStats(packages);
      expect(stats.total).toBe(3);
      expect(stats.apps).toBe(1);
      expect(stats.libs).toBe(1);
      expect(stats.tools).toBe(1);
    });

    it('should count total dependencies', () => {
      const packages = [
        {
          name: 'pkg-1',
          type: 'app',
          description: 'test',
          dependencies: { dep1: '1.0.0', dep2: '2.0.0' },
          peerDependencies: { peer1: '1.0.0' },
          devDependencies: { dev1: '1.0.0' },
        } as any,
      ];

      const stats = calculatePackageStats(packages);
      expect(stats.totalDependencies).toBe(4);
    });
  });

  describe('getUniquePackageTypes', () => {
    it('should return empty array for empty packages', () => {
      const types = getUniquePackageTypes([]);
      expect(types).toEqual([]);
    });

    it('should extract unique types', () => {
      const packages = [
        { name: 'pkg-1', type: 'app', description: 'test' } as any,
        { name: 'pkg-2', type: 'lib', description: 'test' } as any,
        { name: 'pkg-3', type: 'app', description: 'test' } as any,
      ];

      const types = getUniquePackageTypes(packages);
      expect(types).toHaveLength(2);
      expect(types).toContain('app');
      expect(types).toContain('lib');
    });
  });

  describe('filterPackages', () => {
    const packages = [
      { name: 'react-app', type: 'app', description: 'React application' } as any,
      { name: 'utils-lib', type: 'lib', description: 'Utility library' } as any,
      { name: 'build-tool', type: 'tool', description: 'Build tool' } as any,
    ];

    it('should filter by search term in name', () => {
      const filtered = filterPackages(packages, 'react', 'all');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('react-app');
    });

    it('should filter by search term in description', () => {
      const filtered = filterPackages(packages, 'library', 'all');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('utils-lib');
    });

    it('should filter by type', () => {
      const filtered = filterPackages(packages, '', 'lib');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe('lib');
    });

    it('should combine search and type filters', () => {
      const filtered = filterPackages(packages, 'build', 'tool');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('build-tool');
    });

    it('should return empty when no matches', () => {
      const filtered = filterPackages(packages, 'nonexistent', 'all');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('getStatusColor', () => {
    it('should return app color', () => {
      const color = getStatusColor('app');
      expect(color).toBe('bg-blue-100 text-blue-800');
    });

    it('should return lib color', () => {
      const color = getStatusColor('lib');
      expect(color).toBe('bg-green-100 text-green-800');
    });

    it('should return tool color', () => {
      const color = getStatusColor('tool');
      expect(color).toBe('bg-purple-100 text-purple-800');
    });

    it('should return default color for unknown type', () => {
      const color = getStatusColor('unknown');
      expect(color).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getTypeIcon', () => {
    it('should return app icon', () => {
      const icon = getTypeIcon('app');
      expect(icon).toBe('🚀');
    });

    it('should return lib icon', () => {
      const icon = getTypeIcon('lib');
      expect(icon).toBe('📚');
    });

    it('should return tool icon', () => {
      const icon = getTypeIcon('tool');
      expect(icon).toBe('🔧');
    });

    it('should return default icon for unknown type', () => {
      const icon = getTypeIcon('unknown');
      expect(icon).toBe('📦');
    });
  });
});
