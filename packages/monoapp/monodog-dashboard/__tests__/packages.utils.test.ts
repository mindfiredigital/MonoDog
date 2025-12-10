/**
 * Tests for package utilities
 */

import {
  calculatePackageStats,
  getUniquePackageTypes,
  getUniquePackageStatuses,
  filterPackages,
  sortPackages,
} from '../src/components/modules/packages/utils/packages.utils';

describe('Packages Utils', () => {
  it('calculatePackageStats handles empty list', () => {
    const stats = calculatePackageStats([] as any);
    expect(stats.total).toBe(0);
  });

  it('getUniquePackageTypes returns unique types', () => {
    const pkgs = [
      { name: 'a', type: 'app' },
      { name: 'b', type: 'lib' },
      { name: 'c', type: 'app' },
    ] as any;
    const types = getUniquePackageTypes(pkgs);
    expect(types).toHaveLength(2);
  });

  it('filterPackages filters by name', () => {
    const pkgs = [
      { name: 'react-app', type: 'app', description: 'A React app', status: 'healthy' },
      { name: 'utils', type: 'lib', description: 'Utility library', status: 'healthy' },
    ] as any;
    const filtered = filterPackages(pkgs, { search: 'react', type: 'all', status: 'all' });
    expect(filtered).toHaveLength(1);
  });
});
