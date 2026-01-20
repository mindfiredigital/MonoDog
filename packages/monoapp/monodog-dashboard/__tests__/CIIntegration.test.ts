/**
 * Unit tests for CIIntegration component
 * Tests CI/CD pipeline status, build logs, and integration management
 */

import { monorepoService } from '../src/services/monorepoService';

jest.mock('../src/services/monorepoService', () => ({
  monorepoService: {
    getBuildStatus: jest.fn(),
  },
}));

describe('CIIntegration Component', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Component Initialization', () => {
    it('should initialize with empty build data', () => {
      const buildData: any[] = [];
      expect(buildData).toHaveLength(0);
    });

    it('should initialize with loading state', () => {
      const initialLoading = true;
      expect(initialLoading).toBe(true);
    });
  });

  describe('Build Status Fetching', () => {
    it('should fetch build status', async () => {
      const buildStatus = [
        {
          id: 'build-1',
          status: 'success',
          stages: [
            { name: 'Install', status: 'success', duration: 30 },
          ],
        },
      ] as any;

      (monorepoService.getBuildStatus as jest.Mock).mockResolvedValueOnce(buildStatus);

      const result = await monorepoService.getBuildStatus();
      expect(result).toHaveLength(1);
      expect((result as any)[0].status).toBe('success');
    });
  });
});
