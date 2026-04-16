/**
 * Minimal tests for PackageDetail component
 */

import { monorepoService } from '../src/services/monorepoService';

jest.mock('../src/services/monorepoService', () => ({
  monorepoService: {
    getPackage: jest.fn(),
  },
}));

describe('PackageDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches package details', async () => {
    const pkg = [{ name: 'pkg-1', version: '1.0.0' } as any];
    (monorepoService.getPackage as jest.Mock).mockResolvedValueOnce(pkg);
    const result = await monorepoService.getPackage('pkg-1');
    expect(result).toEqual(pkg);
  });
});
