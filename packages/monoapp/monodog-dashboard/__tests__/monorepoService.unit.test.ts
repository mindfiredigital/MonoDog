// Unit tests for monorepoService — single consolidated suite
import { monorepoService, Package } from '../src/services/monorepoService';

beforeAll(() => {
  // provide minimal window ENV used by the service
  (global as any).window = { ENV: { API_URL: 'localhost:8999' } };
});

beforeEach(() => {
  jest.clearAllMocks();
  // mock global fetch by default; individual tests will override resolve/reject
  (global as any).fetch = jest.fn();
});

describe('monorepoService (unit)', () => {
  describe('getPackages', () => {
    it('returns packages on success', async () => {
      const mockPackages: Package[] = [
        { name: 'pkg1', version: '1.0.0', type: 'app', status: 'healthy', lastUpdated: '', dependencies: [], maintainers: [], tags: [], description: '', path: '' },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockPackages) });
      const result = await monorepoService.getPackages();
      expect(result).toEqual(mockPackages);
    });

    it('returns [] on fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const result = await monorepoService.getPackages();
      expect(result).toEqual([]);
    });

    it('returns [] on non-ok and refresh fails', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockRejectedValueOnce(new Error('fail'));
      const result = await monorepoService.getPackages();
      expect(result).toEqual([]);
    });
  });

  describe('getPackage', () => {
    it('returns package on success', async () => {
      const mockPkg: Package[] = [
        { name: 'pkg1', version: '1.0.0', type: 'app', status: 'healthy', lastUpdated: '', dependencies: [], maintainers: [], tags: [], description: '', path: '' },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockPkg) });
      const result = await monorepoService.getPackage('pkg1');
      expect(result).toEqual(mockPkg);
    });

    it('throws on non-ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });
      await expect(monorepoService.getPackage('pkg1')).rejects.toThrow();
    });
  });

  describe('getDependencies', () => {
    it('returns dependency info from packages', async () => {
      const mockPackages: Package[] = [
        { name: 'pkg1', version: '1.0.0', type: 'app', status: 'healthy', lastUpdated: '', dependencies: ['dep1'], maintainers: [], tags: [], description: '', path: '' },
        { name: 'pkg2', version: '1.0.0', type: 'lib', status: 'healthy', lastUpdated: '', dependencies: ['dep2'], maintainers: [], tags: [], description: '', path: '' },
      ];
      jest.spyOn(monorepoService, 'getPackages').mockResolvedValueOnce(mockPackages as any);
      const result = await monorepoService.getDependencies();
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'dep1' }),
          expect.objectContaining({ name: 'dep2' }),
        ])
      );
    });

    it('returns [] on getPackages error', async () => {
      jest.spyOn(monorepoService, 'getPackages').mockRejectedValueOnce(new Error('fail'));
      const result = await monorepoService.getDependencies();
      expect(result).toEqual([]);
    });
  });

  describe('refreshPackages', () => {
    it('returns packages on success', async () => {
      const mockPackages: Package[] = [
        { name: 'pkg1', version: '1.0.0', type: 'app', status: 'healthy', lastUpdated: '', dependencies: [], maintainers: [], tags: [], description: '', path: '' },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockPackages) });
      const result = await monorepoService.refreshPackages();
      expect(result).toEqual(mockPackages);
    });

    it('returns [] on non-ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
      const result = await monorepoService.refreshPackages();
      expect(result).toEqual([]);
    });

    it('returns [] on fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const result = await monorepoService.refreshPackages();
      expect(result).toEqual([]);
    });
  });

  describe('getHealthStatus & refreshHealthStatus', () => {
    it('returns health data on success', async () => {
      const mockHealth = { overallScore: 90, metrics: [], packageHealth: [] } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockHealth) });
      const result = await monorepoService.getHealthStatus();
      expect(result).toEqual(mockHealth);
    });


    it('refreshHealthStatus returns data or fallback', async () => {
      const mockHealth = { overallScore: 95, metrics: [], packageHealth: [] } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockHealth) });
      const result = await monorepoService.refreshHealthStatus();
      expect(result).toEqual(mockHealth);
    });
  });

  describe('updatePackageConfiguration', () => {
    it('returns result on success', async () => {
      const mockResult = { success: true, message: 'ok', package: {} } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockResult), status: 200 });
      const result = await monorepoService.updatePackageConfiguration('pkg', '{}', '/path');
      expect(result).toEqual(mockResult);
    });

    it('throws error on non-ok with error json or text', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 400, text: jest.fn().mockResolvedValueOnce('{"error":"fail"}') });
      await expect(monorepoService.updatePackageConfiguration('pkg', '{}', '/path')).rejects.toThrow();
    });
  });

  describe('getBuildStatus', () => {
    it('returns build status array', async () => {
      const result = await monorepoService.getBuildStatus();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('configuration file APIs', () => {
    it('getConfigurationFiles returns files or [] on error', async () => {
      const mockFiles = { success: true, files: [{ id: '1', name: 'f', path: '', type: 'json', content: '', lastModified: '', size: 1, hasSecrets: false }] } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockFiles) });
      const result = await monorepoService.getConfigurationFiles();
      expect(result).toEqual(mockFiles.files);

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const res2 = await monorepoService.getConfigurationFiles();
      expect(res2).toEqual([]);
    });

    it('saveConfigurationFile returns file or throws on invalid', async () => {
      const mockFile = { success: true, file: { id: '1', name: 'f', path: '', type: 'json', content: '', lastModified: '', size: 1, hasSecrets: false } } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockFile) });
      const result = await monorepoService.saveConfigurationFile('1', '');
      expect(result).toEqual(mockFile.file);

      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce({}) });
      await expect(monorepoService.saveConfigurationFile('1', '')).rejects.toThrow();
    });
  });
});
