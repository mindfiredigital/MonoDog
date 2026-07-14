import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchMonorepoPackages } from '../../src/services/search.service';
import { prisma } from '../../src/db/prisma';

vi.mock('../../src/db/prisma', () => ({
  prisma: {
    package: {
      findMany: vi.fn(),
    },
  },
}));

describe('Search Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return matched packages based on query', async () => {
    const mockPackages = [
      {
        name: 'ui-core',
        description: 'Core UI components',
        type: 'library',
        status: 'active',
        _count: { commits: 0 },
      },
      {
        name: 'api-client',
        description: 'API',
        type: 'library',
        status: 'active',
        _count: { commits: 0 },
      },
    ];
    vi.mocked(prisma.package.findMany).mockResolvedValue(mockPackages as any);

    const response = await searchMonorepoPackages('core');
    expect(prisma.package.findMany).toHaveBeenCalled();
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results[0].name).toContain('core');
  });

  it('should return empty array if no match', async () => {
    vi.mocked(prisma.package.findMany).mockResolvedValue([] as any);

    const response = await searchMonorepoPackages('missing');
    expect(response.results.length).toBe(0);
  });
});
