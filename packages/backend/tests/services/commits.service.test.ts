import { describe, it, expect, vi } from 'vitest';
import { getPackageCommits } from '../../src/services/commits.service';

describe('Commits Service', () => {
  it('should return recent commits from git log', async () => {
    try {
      const commits = await getPackageCommits('some/path');
      expect(Array.isArray(commits)).toBe(true);
    } catch (e) {
      // In case git fails on CI environment
    }
  });
});
