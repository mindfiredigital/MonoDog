/**
 * Pipeline Management Service
 * Handles pipeline tracking, storage, and real-time updates
 */

import type { ReleasePipeline } from '../types/github-actions';
import { AppLogger } from '../middleware/logger';
import { ReleasePipelineRepository } from '../repositories/release-pipeline-repository';
import { PipelineAuditLogRepository } from '../repositories/pipeline-audit-log-repository';
import { prisma } from '../db/prisma';

/**
 * Create or update a release pipeline
 */
export async function createOrUpdatePipeline(
  pipeline: Omit<
    ReleasePipeline,
    'id' | 'workflowRuns' | 'createdAt' | 'updatedAt'
  >
): Promise<{
  id: string;
  releaseVersion: string;
  packageName: string;
}> {
  try {
    return await ReleasePipelineRepository.createOrUpdate(pipeline);
  } catch (error) {
    AppLogger.error(`Failed to create/update pipeline: ${error}`);
    throw error;
  }
}

/**
 * Update pipeline status and conclusion based on workflow run
 */
export async function updatePipelineStatus(
  pipelineId: string,
  currentStatus: string,
  currentConclusion: string | null,
  lastRunId?: string
): Promise<any> {
  try {
    const result = await ReleasePipelineRepository.updateStatus(
      pipelineId,
      currentStatus,
      currentConclusion,
      lastRunId
    );
    AppLogger.info(
      `Updated pipeline ${pipelineId}: status=${currentStatus}, conclusion=${currentConclusion}`
    );
    return result;
  } catch (error) {
    AppLogger.error(`Failed to update pipeline status: ${error}`);
    throw error;
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  pipelineId: string,
  userId: number,
  username: string,
  action: string,
  resourceType: string,
  resourceId: string,
  resourceName: string,
  details: Record<string, unknown> = {},
  status: 'success' | 'failure' | 'pending' = 'success',
  errorMessage?: string
): Promise<void> {
  try {
    await PipelineAuditLogRepository.create(
      pipelineId,
      userId,
      username,
      action,
      resourceType,
      resourceId,
      resourceName,
      details,
      status,
      errorMessage
    );
  } catch (error) {
    AppLogger.error(`Failed to create audit log: ${error}`);
    throw error;
  }
}

/**
 * Get audit logs for a pipeline
 */
export async function getPipelineAuditLogs(
  pipelineId: string,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  try {
    return await PipelineAuditLogRepository.findByPipelineId(
      pipelineId,
      limit,
      offset
    );
  } catch (error) {
    AppLogger.error(`Failed to get audit logs: ${error}`);
    throw error;
  }
}

/**
 * Get recent pipelines for dashboard
 */
export async function getRecentPipelines(
  limit: number = 20,
  offset: number = 0,
  owner?: string,
  repo?: string
): Promise<any[]> {
  try {
    return await ReleasePipelineRepository.getRecent(
      limit,
      offset,
      owner,
      repo
    );
  } catch (error) {
    AppLogger.error(`Failed to get recent pipelines: ${error}`);
    throw error;
  }
}

/**
 * Get a single pipeline by id
 */
export async function getPipelineById(pipelineId: string): Promise<any | null> {
  try {
    return await ReleasePipelineRepository.findById(pipelineId);
  } catch (error) {
    AppLogger.error(`Failed to get pipeline ${pipelineId}: ${error}`);
    throw error;
  }
}

/**
 * Delete old pipelines (cleanup)
 */
export async function deleteOldPipelines(
  daysOld: number = 90
): Promise<number> {
  try {
    const count = await ReleasePipelineRepository.deleteOld(daysOld);
    AppLogger.info(`Deleted ${count} old pipelines`);
    return count;
  } catch (error) {
    AppLogger.error(`Failed to delete old pipelines: ${error}`);
    throw error;
  }
}

/**
 * Schedule a new release
 */
export async function scheduleRelease(
  releaseVersion: string,
  packageName: string,
  scheduledAt: Date,
  triggeredBy: string
) {
  try {
    const existing = await prisma.scheduledRelease.findFirst({
      where: {
        packageName,
        releaseVersion,
        status: 'pending',
      },
    });

    if (existing) {
      throw new Error(
        `A pending release for ${packageName} at version ${releaseVersion} is already scheduled.`
      );
    }

    const scheduledRelease = await prisma.scheduledRelease.create({
      data: {
        releaseVersion,
        packageName,
        scheduledAt,
        status: 'pending',
        triggeredBy,
      },
    });
    AppLogger.info(
      `Scheduled release ${releaseVersion} for ${packageName} at ${scheduledAt}`
    );
    return scheduledRelease;
  } catch (error) {
    AppLogger.error(`Failed to schedule release: ${error}`);
    throw error;
  }
}

/**
 * Cancel a scheduled release
 */
export async function cancelScheduledRelease(id: string) {
  try {
    const existing = await prisma.scheduledRelease.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error(`Scheduled release not found`);
    }

    if (existing.status !== 'pending') {
      throw new Error(
        `Cannot cancel a release that is already ${existing.status}`
      );
    }

    await prisma.scheduledRelease.delete({
      where: { id },
    });

    AppLogger.info(`Cancelled scheduled release ${id}`);
    return true;
  } catch (error) {
    AppLogger.error(`Failed to cancel scheduled release: ${error}`);
    throw error;
  }
}

/**
 * Get pending scheduled releases
 */
export async function getPendingScheduledReleases(limit = 20) {
  try {
    return await prisma.scheduledRelease.findMany({
      where: { status: 'pending' },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
      include: { package: true },
    });
  } catch (error) {
    AppLogger.error(`Failed to get scheduled releases: ${error}`);
    throw error;
  }
}

/**
 * Update scheduled release status
 */
export async function updateScheduledReleaseStatus(id: string, status: string) {
  try {
    return await prisma.scheduledRelease.update({
      where: { id },
      data: { status },
    });
  } catch (error) {
    AppLogger.error(`Failed to update scheduled release status: ${error}`);
    throw error;
  }
}
