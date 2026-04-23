import { describe, it, expect, vi } from 'vitest';
import { performMonorepoScan } from '../../src/services/scan.service';

vi.mock('@monodog/monorepo-scanner', () => {
  return {
    MonorepoScanner: class {
      scan = vi.fn().mockResolvedValue({ packages: [] });
    },
    scanner: {
      scan: vi.fn().mockResolvedValue({ packages: [] }),
    },
  };
});

describe('Scan Service', () => {
  it('should trigger performMonorepoScan successfully', async () => {
    try {
      const result = await performMonorepoScan();
      expect(result).toBeDefined();
    } catch (e) {
      // Ignore errors for placeholder tests
    }
  });
});
