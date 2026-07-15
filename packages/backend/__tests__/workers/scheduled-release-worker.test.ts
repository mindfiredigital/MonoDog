import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  startScheduledReleaseWorker,
  stopScheduledReleaseWorker,
} from '../../src/workers/scheduled-release-worker';
import { prisma } from '../../src/db/prisma';

vi.mock('../../src/db/prisma', () => ({
  prisma: {
    scheduledRelease: {
      findMany: vi.fn(),
    },
    session: {
      findFirst: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('../../src/services/pipeline-service', () => ({
  updateScheduledReleaseStatus: vi.fn(),
  deleteOldPipelines: vi.fn().mockResolvedValue(0),
}));

vi.mock('../../src/utils/utilities', () => ({
  getRepositoryInfoFromGit: vi.fn(),
}));

vi.mock('../../src/services/github-repo-service', () => ({
  createChangesetPullRequest: vi.fn(),
}));

describe('Scheduled Release Worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    stopScheduledReleaseWorker();
    vi.useRealTimers();
  });

  it('should start without error', () => {
    vi.mocked(prisma.scheduledRelease.findMany).mockResolvedValue([]);

    expect(() => startScheduledReleaseWorker('/root')).not.toThrow();
  });

  it('should run checks on interval', () => {
    vi.mocked(prisma.scheduledRelease.findMany).mockResolvedValue([]);

    startScheduledReleaseWorker('/root');
    expect(prisma.scheduledRelease.findMany).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(60 * 1000);
    expect(prisma.scheduledRelease.findMany).toHaveBeenCalledTimes(2);
  });
});
