
/**
 * Pipeline Service Unit Tests
 * Exercises each exported helper with mocks stubbed for the underlying repositories.
 */

import * as service from '../src/services/pipeline-service';
import { ReleasePipelineRepository } from '../src/repositories/release-pipeline-repository';
import { PipelineAuditLogRepository } from '../src/repositories/pipeline-audit-log-repository';
import { AppLogger } from '../src/middleware/logger';

jest.mock('../src/repositories/release-pipeline-repository');
jest.mock('../src/repositories/pipeline-audit-log-repository');
jest.mock('../src/middleware/logger', () => ({
  AppLogger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('Pipeline Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrUpdatePipeline', () => {
    it('returns value from repository', async () => {
      const dummy = { id: '1', releaseVersion: 'v1', packageName: 'pkg' };
      (ReleasePipelineRepository.createOrUpdate as jest.Mock).mockResolvedValue(dummy);

      const result = await service.createOrUpdatePipeline({ releaseVersion: 'v1', packageName: 'pkg', workflowId: '123' } as any);
      expect(result).toBe(dummy);
      expect(ReleasePipelineRepository.createOrUpdate).toHaveBeenCalled();
    });

    it('logs and rethrows when repository fails', async () => {
      const err = new Error('repo fail');
      (ReleasePipelineRepository.createOrUpdate as jest.Mock).mockRejectedValue(err);

      await expect(
        service.createOrUpdatePipeline({ releaseVersion: 'v1', packageName: 'pkg', workflowId: '123' } as any)
      ).rejects.toThrow(err);
      expect(AppLogger.error).toHaveBeenCalled();
    });
  });

  describe('updatePipelineStatus', () => {
    it('forwards call to repository and returns result', async () => {
      const out = { id: 'abc' };
      (ReleasePipelineRepository.updateStatus as jest.Mock).mockResolvedValue(out);

      const r = await service.updatePipelineStatus('abc', 'completed', 'success', '10');
      expect(r).toBe(out);
      expect(AppLogger.info).toHaveBeenCalled();
      expect(ReleasePipelineRepository.updateStatus).toHaveBeenCalledWith('abc', 'completed', 'success', '10');
    });

    it('logs error and rethrows when repo fails', async () => {
      const err = new Error('update fail');
      (ReleasePipelineRepository.updateStatus as jest.Mock).mockRejectedValue(err);

      await expect(service.updatePipelineStatus('abc', 'x', null)).rejects.toThrow(err);
      expect(AppLogger.error).toHaveBeenCalled();
    });
  });

  describe('createAuditLog', () => {
    it('calls repository create', async () => {
      (PipelineAuditLogRepository.create as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.createAuditLog('pid', 1, 'user', 'action', 'type', 'rid', 'name', { foo: 'bar' }, 'success')
      ).resolves.toBeUndefined();
      expect(PipelineAuditLogRepository.create).toHaveBeenCalled();
    });

    it('throws when repository fails', async () => {
      const err = new Error('log fail');
      (PipelineAuditLogRepository.create as jest.Mock).mockRejectedValue(err);

      await expect(
        service.createAuditLog('pid', 1, 'user', 'action', 'type', 'rid', 'name')
      ).rejects.toThrow(err);
      expect(AppLogger.error).toHaveBeenCalled();
    });
  });

  describe('getPipelineAuditLogs', () => {
    it('returns records from repo', async () => {
      const arr = [{ foo: 'bar' }];
      (PipelineAuditLogRepository.findByPipelineId as jest.Mock).mockResolvedValue(arr);
      const r = await service.getPipelineAuditLogs('pid', 5, 0);
      expect(r).toBe(arr);
    });

    it('propagates error', async () => {
      (PipelineAuditLogRepository.findByPipelineId as jest.Mock).mockRejectedValue(new Error('fail'));
      await expect(service.getPipelineAuditLogs('pid')).rejects.toThrow();
      expect(AppLogger.error).toHaveBeenCalled();
    });
  });

  describe('getRecentPipelines', () => {
    it('fetches and returns data', async () => {
      const arr = [{ id: 1 }];
      (ReleasePipelineRepository.getRecent as jest.Mock).mockResolvedValue(arr);
      const r = await service.getRecentPipelines(1, 0);
      expect(r).toBe(arr);
    });
    it('handles repo error', async () => {
      (ReleasePipelineRepository.getRecent as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(service.getRecentPipelines()).rejects.toThrow();
      expect(AppLogger.error).toHaveBeenCalled();
    });
  });

  describe('deleteOldPipelines', () => {
    it('deletes and returns count', async () => {
      (ReleasePipelineRepository.deleteOld as jest.Mock).mockResolvedValue(42);
      const count = await service.deleteOldPipelines(30);
      expect(count).toBe(42);
      expect(AppLogger.info).toHaveBeenCalled();
    });
    it('propagates error', async () => {
      (ReleasePipelineRepository.deleteOld as jest.Mock).mockRejectedValue(new Error('err'));
      await expect(service.deleteOldPipelines()).rejects.toThrow();
      expect(AppLogger.error).toHaveBeenCalled();
    });
  });
});
