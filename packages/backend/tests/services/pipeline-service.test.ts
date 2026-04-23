import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createOrUpdatePipeline,
  updatePipelineStatus,
  getRecentPipelines,
} from '../../src/services/pipeline-service';
import { ReleasePipelineRepository } from '../../src/repositories/release-pipeline-repository';

vi.mock('../../src/repositories/release-pipeline-repository', () => ({
  ReleasePipelineRepository: {
    createOrUpdate: vi.fn(),
    updateStatus: vi.fn(),
    getRecent: vi.fn(),
    deleteOld: vi.fn(),
  },
}));

describe('Pipeline Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrUpdatePipeline', () => {
    it('should create or update a pipeline using repository', async () => {
      const mockResult = {
        id: 'pipe-1',
        releaseVersion: 'v1.0.0',
        packageName: 'core',
      };
      vi.mocked(ReleasePipelineRepository.createOrUpdate).mockResolvedValue(
        mockResult as any
      );

      const payload = {
        releaseVersion: 'v1.0.0',
        packageName: 'core',
        status: 'pending',
        initiator: 'user',
      };
      const result = await createOrUpdatePipeline(payload as any);

      expect(ReleasePipelineRepository.createOrUpdate).toHaveBeenCalledWith(
        payload
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw error if repository fails', async () => {
      vi.mocked(ReleasePipelineRepository.createOrUpdate).mockRejectedValue(
        new Error('DB error')
      );

      await expect(createOrUpdatePipeline({} as any)).rejects.toThrow(
        'DB error'
      );
    });
  });

  describe('updatePipelineStatus', () => {
    it('should update pipeline status using repository', async () => {
      vi.mocked(ReleasePipelineRepository.updateStatus).mockResolvedValue(
        true as any
      );

      const result = await updatePipelineStatus(
        'pipe-1',
        'success',
        'completed'
      );
      expect(ReleasePipelineRepository.updateStatus).toHaveBeenCalledWith(
        'pipe-1',
        'success',
        'completed',
        undefined
      );
      expect(result).toBe(true);
    });
  });

  describe('getRecentPipelines', () => {
    it('should retrieve recent pipelines', async () => {
      vi.mocked(ReleasePipelineRepository.getRecent).mockResolvedValue([
        { id: 'pipe-1' },
      ] as any);

      const result = await getRecentPipelines(10, 0);
      expect(ReleasePipelineRepository.getRecent).toHaveBeenCalledWith(10, 0);
      expect(result.length).toBe(1);
    });
  });
});
