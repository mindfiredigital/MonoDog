import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPublishPackages,
  createChangeset,
} from '../../src/controllers/publish-controller';

describe('Publish Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
  });

  it('should have a handler for getting publishable packages', () => {
    expect(getPublishPackages).toBeDefined();
  });

  it('should have a handler for creating changesets', () => {
    expect(createChangeset).toBeDefined();
  });
});
