import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as pipelineService from '../../src/services/pipeline-service';
import { ReleasePipelineRepository } from '../../src/repositories/release-pipeline-repository';
import { prisma } from '../../src/db/prisma';

vi.mock('../../src/repositories/release-pipeline-repository');
vi.mock('../../src/repositories/pipeline-audit-log-repository');
vi.mock('../../src/db/prisma', () => ({
  prisma: {
    scheduledRelease: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Pipeline Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrUpdatePipeline', () => {
    it('should call ReleasePipelineRepository.createOrUpdate', async () => {
      const pipelineData = {
        releaseVersion: '1.0.0',
        packageName: 'pkg-a',
        status: 'pending',
        currentStage: 'build',
      };
      vi.mocked(ReleasePipelineRepository.createOrUpdate).mockResolvedValue({
        id: '1',
        ...pipelineData,
      } as any);

      const result = await pipelineService.createOrUpdatePipeline(
        pipelineData as any
      );
      expect(ReleasePipelineRepository.createOrUpdate).toHaveBeenCalledWith(
        pipelineData
      );
      expect(result.id).toBe('1');
    });
  });

  describe('scheduleRelease', () => {
    it('should throw if release already scheduled', async () => {
      vi.mocked(prisma.scheduledRelease.findFirst).mockResolvedValue({
        id: '1',
      } as any);

      await expect(
        pipelineService.scheduleRelease('1.0.0', 'pkg-a', new Date(), 'user')
      ).rejects.toThrow(/already scheduled/);
    });

    it('should create scheduled release if not exists', async () => {
      vi.mocked(prisma.scheduledRelease.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.scheduledRelease.create).mockResolvedValue({
        id: '2',
      } as any);

      const result = await pipelineService.scheduleRelease(
        '1.0.0',
        'pkg-a',
        new Date(),
        'user'
      );
      expect(prisma.scheduledRelease.create).toHaveBeenCalled();
      expect(result.id).toBe('2');
    });
  });

  describe('cancelScheduledRelease', () => {
    it('should throw if release not found', async () => {
      vi.mocked(prisma.scheduledRelease.findUnique).mockResolvedValue(null);

      await expect(pipelineService.cancelScheduledRelease('1')).rejects.toThrow(
        /not found/
      );
    });

    it('should throw if release is not pending', async () => {
      vi.mocked(prisma.scheduledRelease.findUnique).mockResolvedValue({
        id: '1',
        status: 'completed',
      } as any);

      await expect(pipelineService.cancelScheduledRelease('1')).rejects.toThrow(
        /Cannot cancel/
      );
    });

    it('should delete release if pending', async () => {
      vi.mocked(prisma.scheduledRelease.findUnique).mockResolvedValue({
        id: '1',
        status: 'pending',
      } as any);

      await pipelineService.cancelScheduledRelease('1');
      expect(prisma.scheduledRelease.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
