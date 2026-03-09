import { getPrismaClient } from './prisma-client';
import type { ReleasePipeline } from '../types/github-actions';

const prisma = getPrismaClient();

/**
 * Release Pipeline Repository - Handles all ReleasePipeline-related database operations
 */
export class ReleasePipelineRepository {
  /**
   * Create or update a release pipeline
   */
  static async createOrUpdate(
    pipeline: Omit<ReleasePipeline, 'id' | 'workflowRuns' | 'createdAt' | 'updatedAt'>
  ): Promise<{
    id: string;
    releaseVersion: string;
    packageName: string;
  }> {
    const existing = await prisma.releasePipeline.findFirst({
      where: {
        releaseVersion: pipeline.releaseVersion,
        packageName: pipeline.packageName,
        owner: pipeline.owner,
        repo: pipeline.repo,
      },
    });

    let result;
    if (existing) {
      result = await prisma.releasePipeline.update({
        where: { id: existing.id },
        data: {
          currentStatus: pipeline.currentStatus,
          currentConclusion: pipeline.currentConclusion,
          lastRunId: pipeline.lastRunId ? String(pipeline.lastRunId) : null,
          triggeredAt: pipeline.triggeredAt,
        },
      });
    } else {
      result = await prisma.releasePipeline.create({
        data: {
          releaseVersion: pipeline.releaseVersion,
          packageName: pipeline.packageName,
          owner: pipeline.owner,
          repo: pipeline.repo,
          workflowId: pipeline.workflowId,
          workflowName: pipeline.workflowName,
          workflowPath: pipeline.workflowPath,
          triggerType: pipeline.triggerType,
          triggeredBy: pipeline.triggeredBy,
          triggeredAt: pipeline.triggeredAt,
          currentStatus: pipeline.currentStatus,
          currentConclusion: pipeline.currentConclusion,
          lastRunId: pipeline.lastRunId ? String(pipeline.lastRunId) : null,
        },
      });
    }

    return {
      id: result.id,
      releaseVersion: result.releaseVersion,
      packageName: result.packageName,
    };
  }

  /**
   * Update pipeline status and conclusion
   */
  static async updateStatus(
    pipelineId: string,
    currentStatus: string,
    currentConclusion: string | null,
    lastRunId?: string
  ): Promise<any> {
    return await prisma.releasePipeline.update({
      where: { id: pipelineId },
      data: {
        currentStatus,
        currentConclusion,
        ...(lastRunId && { lastRunId: String(lastRunId) }),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get recent pipelines for dashboard
   */
  static async getRecent(limit: number = 20, offset: number = 0): Promise<any[]> {
    const pipelines = await prisma.releasePipeline.findMany({
      orderBy: { triggeredAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Enrich with workflowPath if not already set
    return pipelines.map((p: ReleasePipeline) => ({
      ...p,
      workflowPath: p.workflowPath || 'release.yml',
    }));
  }

  /**
   * Delete old pipelines (cleanup)
   */
  static async deleteOld(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.releasePipeline.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  /**
   * Find pipeline by ID
   */
  static async findById(id: string): Promise<any> {
    return await prisma.releasePipeline.findUnique({
      where: { id },
    });
  }

  /**
   * Find pipeline by release version and package name
   */
  static async findByReleaseAndPackage(
    releaseVersion: string,
    packageName: string
  ): Promise<any> {
    return await prisma.releasePipeline.findFirst({
      where: {
        releaseVersion,
        packageName,
      },
    });
  }
}
