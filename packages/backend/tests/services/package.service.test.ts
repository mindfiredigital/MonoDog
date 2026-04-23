import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllPackages,
  getPackageByName,
} from '../../src/services/package.service';
import { scanMonorepo } from '@monodog/utils/helpers';
import { prisma } from '../../src/db/prisma';

vi.mock('../../src/db/prisma', () => ({
  prisma: {
    package: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../src/utils/helpers', () => ({
  storePackage: vi.fn(),
}));

vi.mock('@monodog/utils/helpers', () => ({
  scanMonorepo: vi.fn(),
}));

vi.mock('@monodog/monorepo-scanner', () => ({
  generateReports: vi.fn().mockResolvedValue([]),
}));

vi.mock('@monodog/ci-status', () => ({
  ciStatusManager: {
    getPackageStatus: vi.fn().mockResolvedValue({}),
  },
}));

describe('Package Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPackages', () => {
    it('should return packages from db if available', async () => {
      const mockDbPackages = [
        { name: 'ui', version: '1.0.0', maintainers: '[]' },
        { name: 'api', version: '2.0.0', maintainers: '[]' },
      ];
      vi.mocked(prisma.package.findMany).mockResolvedValue(
        mockDbPackages as any
      );

      const packages = await getAllPackages('root');
      expect(prisma.package.findMany).toHaveBeenCalledTimes(1);
      expect(scanMonorepo).not.toHaveBeenCalled();
      expect(packages.length).toBe(2);
      expect(packages[0].name).toBe('ui');
    });

    it('should scan and store if db is empty', async () => {
      vi.mocked(prisma.package.findMany)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { name: 'ui', version: '1.0.0', maintainers: '[]' },
        ] as any);

      vi.mocked(scanMonorepo).mockReturnValue([
        { name: 'ui', version: '1.0.0' },
      ] as any);

      const packages = await getAllPackages('root');
      expect(scanMonorepo).toHaveBeenCalled();
      expect(packages.length).toBe(1);
      expect(packages[0].name).toBe('ui');
    });
  });

  describe('getPackageByName', () => {
    it('should return a specific package by name', async () => {
      const mockPkg = { name: 'api', version: '2.0.0', maintainers: '[]' };
      vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPkg as any);

      const pkg = await getPackageByName('api');
      expect(pkg).toBeDefined();
      expect(pkg.version).toBe('2.0.0');
    });

    it('should throw error if package not found', async () => {
      vi.mocked(prisma.package.findUnique).mockResolvedValue(null as any);

      await expect(getPackageByName('nonexistent')).rejects.toThrow(
        'Package not found'
      );
    });
  });
});
