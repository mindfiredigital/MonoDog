import { CIStatusManager, ciStatusManager } from '../src/utils/ci-status';
import type { PackageInfo } from '../src/utils/utilities';

describe('ci-status utilities', () => {
  test('add/get/remove providers', () => {
    const mgr = new CIStatusManager();
    const before = mgr.getProviders();
    mgr.addProvider({ name: 'TestCI', type: 'custom', baseUrl: 'https://ci.test' });
    const after = mgr.getProviders();
    expect(after.length).toBeGreaterThanOrEqual(before.length + 1);

    mgr.removeProvider('TestCI');
    const afterRemove = mgr.getProviders();
    expect(afterRemove.find(p => p.name === 'TestCI')).toBeUndefined();
  });

  test('getPackageStatus and caching behavior', async () => {
    const mgr = new CIStatusManager();
    // First call should produce a status
    const status1 = await mgr.getPackageStatus('some-package');
    expect(status1).not.toBeNull();
    // Second call should come from cache (same reference)
    const status2 = await mgr.getPackageStatus('some-package');
    expect(status2).toEqual(status1);
  });

  test('getMonorepoStatus aggregates data', async () => {
    const mgr = new CIStatusManager();
    const pkgs: PackageInfo[] = [
      { name: 'some-package', version: '1.0.0', type: 'lib', path: 'packages/some', dependencies: {}, devDependencies: {}, peerDependencies: {}, scripts: {}, maintainers: [] },
    ];

    const status = await mgr.getMonorepoStatus(pkgs);
    expect(status.totalPackages).toBe(pkgs.length);
    expect(typeof status.overallHealth).toBe('number');
    expect(Array.isArray(status.recentBuilds)).toBe(true);
  });

  test('triggerBuild returns success and buildId', async () => {
    const result = await ciStatusManager.triggerBuild('pkg', 'GitHub Actions', 'main');
    expect(result.success).toBe(true);
    expect(result.buildId).toBeDefined();
  });

  test('getBuildLogs and getBuildArtifacts return expected shapes', async () => {
    const logs = await ciStatusManager.getBuildLogs('build-123', 'GitHub Actions');
    expect(typeof logs).toBe('string');

    const artifacts = await ciStatusManager.getBuildArtifacts('build-123', 'GitHub Actions');
    expect(Array.isArray(artifacts)).toBe(true);
    expect(artifacts.length).toBeGreaterThan(0);
  });
});
