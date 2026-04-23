import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  performScan,
  getScanResults,
} from '../../src/controllers/scan.controller';
import * as scanService from '../../src/services/scan.service';

vi.mock('../../src/services/scan.service');

describe('Scan Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = { body: {} };
    res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    vi.clearAllMocks();
  });

  describe('performScan', () => {
    it('should trigger a scan and return results', async () => {
      req.body.force = true;
      const mockResult = { packages: 10, duration: 150 };
      vi.mocked(scanService.performMonorepoScan).mockResolvedValue(
        mockResult as any
      );

      await performScan(req, res);

      expect(scanService.performMonorepoScan).toHaveBeenCalledWith(true);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle scan errors', async () => {
      vi.mocked(scanService.performMonorepoScan).mockRejectedValue(
        new Error('Scan failed')
      );

      await performScan(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });
});
