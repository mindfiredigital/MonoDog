import { getPrismaClient } from './prisma-client';
import type { PipelineAuditLog as AuditLogType } from '../types/github-actions';

const prisma = getPrismaClient();

/**
 * Pipeline Audit Log Repository - Handles all PipelineAuditLog-related database operations
 */
export class PipelineAuditLogRepository {
  /**
   * Create an audit log entry
   */
  static async create(
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
    await prisma.pipelineAuditLog.create({
      data: {
        pipelineId,
        userId,
        username,
        action,
        resourceType,
        resourceId,
        resourceName,
        details: JSON.stringify(details),
        status,
        errorMessage,
      },
    });
  }

  /**
   * Get audit logs for a pipeline
   */
  static async findByPipelineId(
    pipelineId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    return await prisma.pipelineAuditLog.findMany({
      where: { pipelineId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get audit logs by action
   */
  static async findByAction(
    action: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    return await prisma.pipelineAuditLog.findMany({
      where: { action },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get audit logs by user
   */
  static async findByUser(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    return await prisma.pipelineAuditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get audit logs by status
   */
  static async findByStatus(
    status: 'success' | 'failure' | 'pending',
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    return await prisma.pipelineAuditLog.findMany({
      where: { status },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get count of audit logs for a pipeline
   */
  static async countByPipelineId(pipelineId: string): Promise<number> {
    return await prisma.pipelineAuditLog.count({
      where: { pipelineId },
    });
  }
}
