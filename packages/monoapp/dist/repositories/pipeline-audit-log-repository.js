"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineAuditLogRepository = void 0;
const prisma_client_1 = require("./prisma-client");
const prisma = (0, prisma_client_1.getPrismaClient)();
/**
 * Pipeline Audit Log Repository - Handles all PipelineAuditLog-related database operations
 */
class PipelineAuditLogRepository {
    /**
     * Create an audit log entry
     */
    static async create(pipelineId, userId, username, action, resourceType, resourceId, resourceName, details = {}, status = 'success', errorMessage) {
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
    static async findByPipelineId(pipelineId, limit = 50, offset = 0) {
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
    static async findByAction(action, limit = 50, offset = 0) {
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
    static async findByUser(userId, limit = 50, offset = 0) {
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
    static async findByStatus(status, limit = 50, offset = 0) {
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
    static async countByPipelineId(pipelineId) {
        return await prisma.pipelineAuditLog.count({
            where: { pipelineId },
        });
    }
}
exports.PipelineAuditLogRepository = PipelineAuditLogRepository;
