import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getConfigFiles } from '../../src/controllers/config.controller';
import * as configService from '../../src/services/config.service';

vi.mock('../../src/services/config.service', () => ({
  findMonorepoRoot: vi.fn(() => '/mock/root'),
  scanConfigFiles: vi.fn(),
  getFileType: vi.fn(),
  containsSecrets: vi.fn(),
}));

describe('Config Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = {};
    res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    vi.clearAllMocks();
  });

  describe('getConfigFiles', () => {
    it('should return config files successfully', async () => {
      const mockFiles = [
        {
          id: '1',
          name: 'package.json',
          path: '/mock/root/package.json',
          type: 'json',
          content: '{}',
        },
      ];
      vi.mocked(configService.scanConfigFiles).mockResolvedValue(
        mockFiles as any
      );

      await getConfigFiles(req, res);

      expect(configService.findMonorepoRoot).toHaveBeenCalled();
      expect(configService.scanConfigFiles).toHaveBeenCalledWith('/mock/root');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, files: expect.any(Array) })
      );
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(configService.scanConfigFiles).mockRejectedValue(
        new Error('Permission denied')
      );

      await getConfigFiles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: expect.any(String) })
      );
    });
  });
});
