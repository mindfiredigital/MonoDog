"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleasePipelineRepository = void 0;
const prisma_client_1 = require("./prisma-client");
const prisma = (0, prisma_client_1.getPrismaClient)();
/**
 * Release Pipeline Repository - Handles all ReleasePipeline-related database operations
 */
class ReleasePipelineRepository {
    /**
     * Create or update a release pipeline
     */
    static async createOrUpdate(pipeline) {
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
        }
        else {
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
    static async updateStatus(pipelineId, currentStatus, currentConclusion, lastRunId) {
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
    static async getRecent(limit = 20, offset = 0) {
        const pipelines = await prisma.releasePipeline.findMany({
            orderBy: { triggeredAt: 'desc' },
            take: limit,
            skip: offset,
        });
        // Enrich with workflowPath if not already set
        return pipelines.map((p) => ({
            ...p,
            workflowPath: p.workflowPath || 'release.yml',
        }));
    }
    /**
     * Delete old pipelines (cleanup)
     */
    static async deleteOld(daysOld = 90) {
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
    static async findById(id) {
        return await prisma.releasePipeline.findUnique({
            where: { id },
        });
    }
    /**
     * Find pipeline by release version and package name
     */
    static async findByReleaseAndPackage(releaseVersion, packageName) {
        return await prisma.releasePipeline.findFirst({
            where: {
                releaseVersion,
                packageName,
            },
        });
    }
}
exports.ReleasePipelineRepository = ReleasePipelineRepository;
