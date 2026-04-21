import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPackages,
  getPackageDetails,
} from '../../src/controllers/packages.controller';
import * as packageService from '../../src/services/package.service';

vi.mock('../../src/services/package.service', () => ({
  getAllPackages: vi.fn(),
  getPackageByName: vi.fn(),
}));

describe('Packages Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = { params: {}, app: { locals: { rootPath: 'path' } } };
    res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    vi.clearAllMocks();
  });

  describe('getPackages', () => {
    it('should return all packages', async () => {
      const mockPackages = [{ name: 'frontend' }];
      vi.mocked(packageService.getAllPackages).mockResolvedValue(
        mockPackages as any
      );

      await getPackages(req, res);

      expect(packageService.getAllPackages).toHaveBeenCalledWith('path');
      expect(res.json).toHaveBeenCalledWith(mockPackages);
    });
  });

  describe('getPackageDetails', () => {
    it('should return package details for a specific package', async () => {
      req.params.name = 'frontend';
      const mockDetails = { name: 'frontend', version: '1.0.0' };
      vi.mocked(packageService.getPackageByName).mockResolvedValue(
        mockDetails as any
      );

      await getPackageDetails(req, res);

      expect(packageService.getPackageByName).toHaveBeenCalledWith('frontend');
      expect(res.json).toHaveBeenCalledWith(mockDetails);
    });
  });
});
