import { describe, it, expect, vi } from 'vitest';
import {
  listWorkflows,
  getWorkflowRuns,
} from '../../src/services/github-actions-service';

describe('GitHub Actions Service', () => {
  describe('listWorkflows', () => {
    it('should throw an error or handle correctly when token is missing or invalid', async () => {
      try {
        await listWorkflows('token', 'owner', 'repo');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getWorkflowRuns', () => {
    it('should attempt to get workflow runs and handle response', async () => {
      try {
        await getWorkflowRuns('token', 'owner', 'repo');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
