import { describe, it, expect, vi } from 'vitest';
import { searchMonorepoPackages } from '../../src/services/search.service';
import { scanMonorepo } from '@monodog/utils/helpers';

vi.mock('@monodog/utils/helpers', () => ({
  scanMonorepo: vi.fn(),
}));

describe('Search Service', () => {
  it('should return matched packages based on query', async () => {
    const mockPackages = [
      { name: 'ui-core', description: 'Core UI components' },
      { name: 'api-client', description: 'API' },
    ];
    vi.mocked(scanMonorepo).mockReturnValue(mockPackages as any);

    const response = await searchMonorepoPackages('core');
    expect(scanMonorepo).toHaveBeenCalled();
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results[0].name).toContain('core');
  });

  it('should return empty array if no match', async () => {
    vi.mocked(scanMonorepo).mockReturnValue([{ name: 'api-client' }] as any);

    const response = await searchMonorepoPackages('missing');
    expect(response.results.length).toBe(0);
  });
});
