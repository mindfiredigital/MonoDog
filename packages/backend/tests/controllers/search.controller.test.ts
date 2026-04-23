import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchPackages } from '../../src/controllers/search.controller';
import * as searchService from '../../src/services/search.service';

vi.mock('../../src/services/search.service');

describe('Search Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = { query: {} };
    res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    vi.clearAllMocks();
  });

  it('should return search results successfully', async () => {
    req.query.q = 'test-query';
    const mockResults = [{ name: 'test-pkg' }];
    vi.mocked(searchService.searchMonorepoPackages).mockResolvedValue(
      mockResults as any
    );

    await searchPackages(req, res);

    expect(searchService.searchMonorepoPackages).toHaveBeenCalledWith(
      'test-query',
      undefined,
      undefined
    );
    expect(res.json).toHaveBeenCalledWith(mockResults);
  });

  it('should handle missing query parameter', async () => {
    await searchPackages(req, res);
    expect(searchService.searchMonorepoPackages).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined
    );
  });

  it('should handle errors during search', async () => {
    req.query.q = 'error-query';
    vi.mocked(searchService.searchMonorepoPackages).mockRejectedValue(
      new Error('Search failed')
    );

    await searchPackages(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
