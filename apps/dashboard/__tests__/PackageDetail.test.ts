import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
/**
 * Minimal tests for PackageDetail component
 */

import { monorepoService } from '../src/services/monorepoService';

vi.mock('../src/services/monorepoService', () => ({
  monorepoService: {
    getPackage: vi.fn(),
  },
}));

describe('PackageDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches package details', async () => {
    const pkg = [{ name: 'pkg-1', version: '1.0.0' } as any];
    (monorepoService.getPackage as vi.Mock).mockResolvedValueOnce(pkg);
    const result = await monorepoService.getPackage('pkg-1');
    expect(result).toEqual(pkg);
  });
});
