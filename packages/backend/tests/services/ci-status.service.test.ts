import { describe, it, expect, vi } from 'vitest';
import {
  getMonorepoCIStatus,
  getPackageCIStatus,
  triggerCIBuild,
} from '../../src/services/ci-status.service';
import {
  ciStatusManager,
  getMonorepoCIStatus as getMonorepoCIStatusCore,
} from '@monodog/ci-status';
import { scanMonorepo } from '@monodog/utils/helpers';

vi.mock('@monodog/utils/helpers', () => ({
  scanMonorepo: vi.fn(),
}));

vi.mock('@monodog/ci-status', () => ({
  ciStatusManager: {
    getPackageStatus: vi.fn(),
    triggerBuild: vi.fn(),
  },
  getMonorepoCIStatus: vi.fn(),
}));

describe('CI Status Service', () => {
  describe('getMonorepoCIStatus', () => {
    it('should scan monorepo and fetch overall CI status', async () => {
      vi.mocked(scanMonorepo).mockReturnValue([{ name: 'core' }] as any);
      vi.mocked(getMonorepoCIStatusCore).mockResolvedValue({
        totalPackages: 1,
      } as any);

      const status = await getMonorepoCIStatus();

      expect(scanMonorepo).toHaveBeenCalled();
      expect(getMonorepoCIStatusCore).toHaveBeenCalledWith([{ name: 'core' }]);
      expect(status.totalPackages).toBe(1);
    });
  });

  describe('getPackageCIStatus', () => {
    it('should return package CI status if found', async () => {
      vi.mocked(ciStatusManager.getPackageStatus).mockResolvedValue({
        status: 'passed',
      } as any);

      const status = await getPackageCIStatus('core');
      expect(status).toEqual({ status: 'passed' });
    });

    it('should throw an error if package CI status is not found', async () => {
      vi.mocked(ciStatusManager.getPackageStatus).mockResolvedValue(
        null as any
      );

      await expect(getPackageCIStatus('unknown')).rejects.toThrow(
        'Package CI status not found'
      );
    });
  });

  describe('triggerCIBuild', () => {
    it('should trigger a build successfully', async () => {
      vi.mocked(ciStatusManager.triggerBuild).mockResolvedValue({
        success: true,
        buildId: '123',
      } as any);

      const result = await triggerCIBuild('core');
      expect(ciStatusManager.triggerBuild).toHaveBeenCalledWith(
        'core',
        'github',
        'main'
      );
      expect(result.success).toBe(true);
      expect(result.buildId).toBe('123');
    });

    it('should throw an error if package name is missing', async () => {
      await expect(triggerCIBuild('')).rejects.toThrow(
        'Package name is required'
      );
    });

    it('should throw an error if build trigger fails', async () => {
      vi.mocked(ciStatusManager.triggerBuild).mockResolvedValue({
        success: false,
        error: 'Provider down',
      } as any);

      await expect(triggerCIBuild('core')).rejects.toThrow('Provider down');
    });
  });
});
