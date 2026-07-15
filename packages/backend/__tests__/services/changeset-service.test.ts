import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as changesetService from '../../src/services/changeset-service';
import * as packageService from '../../src/services/package.service';

// Mock dependencies
vi.mock('../../src/services/package.service', () => ({
  getPackagesService: vi.fn(),
}));

vi.mock('child_process', () => ({
  exec: vi.fn((cmd, options, callback) =>
    callback(null, { stdout: '', stderr: '' })
  ),
}));

vi.mock('fs/promises', () => ({
  default: {
    readdir: vi.fn(),
    readFile: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  },
}));

describe('Changeset Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWorkspacePackages', () => {
    it('should format packages correctly', async () => {
      vi.mocked(packageService.getPackagesService).mockResolvedValue([
        { name: 'pkg-a', version: '1.0.0', path: '/pkg-a' },
      ] as any);

      const result = await changesetService.getWorkspacePackages('/root');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('pkg-a');
      expect(result[0].version).toBe('1.0.0');
    });
  });

  describe('calculateNewVersions', () => {
    it('should bump major correctly', () => {
      const packages = [
        { name: 'pkg-a', version: '1.2.3', path: '', type: 'lib' as const },
      ];
      const bumps = [{ package: 'pkg-a', bumpType: 'major' as const }];

      const result = changesetService.calculateNewVersions(packages, bumps);
      expect(result[0].newVersion).toBe('2.0.0');
    });

    it('should bump minor correctly', () => {
      const packages = [
        { name: 'pkg-a', version: '1.2.3', path: '', type: 'lib' as const },
      ];
      const bumps = [{ package: 'pkg-a', bumpType: 'minor' as const }];

      const result = changesetService.calculateNewVersions(packages, bumps);
      expect(result[0].newVersion).toBe('1.3.0');
    });

    it('should bump patch correctly', () => {
      const packages = [
        { name: 'pkg-a', version: '1.2.3', path: '', type: 'lib' as const },
      ];
      const bumps = [{ package: 'pkg-a', bumpType: 'patch' as const }];

      const result = changesetService.calculateNewVersions(packages, bumps);
      expect(result[0].newVersion).toBe('1.2.4');
    });
  });

  describe('validateChangeset', () => {
    it('should return error if summary is too short', async () => {
      vi.mocked(packageService.getPackagesService).mockResolvedValue([
        { name: 'pkg-a', version: '1.0.0', path: '/pkg-a' },
      ] as any);

      const result = await changesetService.validateChangeset(
        '/root',
        ['pkg-a'],
        'short'
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Summary must be at least 10 characters');
    });

    it('should return error if package not found', async () => {
      vi.mocked(packageService.getPackagesService).mockResolvedValue([
        { name: 'pkg-a', version: '1.0.0', path: '/pkg-a' },
      ] as any);

      const result = await changesetService.validateChangeset(
        '/root',
        ['pkg-b'],
        'long enough summary'
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Package pkg-b not found');
    });
  });
});
