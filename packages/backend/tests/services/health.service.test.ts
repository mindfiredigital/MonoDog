import { describe, it, expect, vi } from 'vitest';
import {
  getSystemHealth,
  getPackageHealthMetrics,
} from '../../src/services/health.service';
import * as utils from '@monodog/utils/helpers';
import * as scanner from '@monodog/monorepo-scanner';

vi.mock('../../src/db/prisma', () => ({
  prisma: {
    packageHealth: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock('@monodog/utils/helpers', () => ({
  scanMonorepo: vi.fn(),
  calculatePackageHealth: vi.fn(),
}));

vi.mock('@monodog/monorepo-scanner', () => ({
  funCheckBuildStatus: vi.fn(),
  funCheckTestCoverage: vi.fn(),
  funCheckLintStatus: vi.fn(),
  funCheckSecurityAudit: vi.fn(),
}));

describe('Health Service', () => {
  describe('getSystemHealth', () => {
    it('should return system health status', () => {
      const health = getSystemHealth();
      expect(health.status).toBe('ok');
      expect(health.services).toBeDefined();
      expect(health.timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('getPackageHealthMetrics', () => {
    it('should throw error if package not found', async () => {
      vi.mocked(utils.scanMonorepo).mockReturnValue([]);

      await expect(getPackageHealthMetrics('non-existent')).rejects.toThrow(
        'Package not found'
      );
    });

    it('should return metrics for a found package', async () => {
      const mockPackage = {
        name: 'test-pkg',
        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
      };
      vi.mocked(utils.scanMonorepo).mockReturnValue([mockPackage as any]);
      vi.mocked(scanner.funCheckBuildStatus).mockResolvedValue('success');
      vi.mocked(scanner.funCheckTestCoverage).mockResolvedValue(80);
      vi.mocked(scanner.funCheckLintStatus).mockResolvedValue('pass');
      vi.mocked(scanner.funCheckSecurityAudit).mockResolvedValue('pass');
      vi.mocked(utils.calculatePackageHealth).mockReturnValue({
        overallScore: 85,
      } as any);

      const metrics = await getPackageHealthMetrics('test-pkg');

      expect(metrics.packageName).toBe('test-pkg');
      expect(metrics.health.overallScore).toBe(85);
      expect(metrics.health.buildStatus).toBe('success');
    });
  });
});
