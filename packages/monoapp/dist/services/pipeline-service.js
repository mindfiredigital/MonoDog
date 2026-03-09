"use strict";
/**
 * Pipeline Management Service
 * Handles pipeline tracking, storage, and real-time updates
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdatePipeline = createOrUpdatePipeline;
exports.updatePipelineStatus = updatePipelineStatus;
exports.createAuditLog = createAuditLog;
exports.getPipelineAuditLogs = getPipelineAuditLogs;
exports.getRecentPipelines = getRecentPipelines;
exports.deleteOldPipelines = deleteOldPipelines;
const logger_1 = require("../middleware/logger");
const release_pipeline_repository_1 = require("../repositories/release-pipeline-repository");
const pipeline_audit_log_repository_1 = require("../repositories/pipeline-audit-log-repository");
/**
 * Create or update a release pipeline
 */
async function createOrUpdatePipeline(pipeline) {
    try {
        return await release_pipeline_repository_1.ReleasePipelineRepository.createOrUpdate(pipeline);
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to create/update pipeline: ${error}`);
        throw error;
    }
}
/**
 * Update pipeline status and conclusion based on workflow run
 */
async function updatePipelineStatus(pipelineId, currentStatus, currentConclusion, lastRunId) {
    try {
        const result = await release_pipeline_repository_1.ReleasePipelineRepository.updateStatus(pipelineId, currentStatus, currentConclusion, lastRunId);
        logger_1.AppLogger.info(`Updated pipeline ${pipelineId}: status=${currentStatus}, conclusion=${currentConclusion}`);
        return result;
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to update pipeline status: ${error}`);
        throw error;
    }
}
/**
 * Create audit log entry
 */
async function createAuditLog(pipelineId, userId, username, action, resourceType, resourceId, resourceName, details = {}, status = 'success', errorMessage) {
    try {
        await pipeline_audit_log_repository_1.PipelineAuditLogRepository.create(pipelineId, userId, username, action, resourceType, resourceId, resourceName, details, status, errorMessage);
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to create audit log: ${error}`);
        throw error;
    }
}
/**
 * Get audit logs for a pipeline
 */
async function getPipelineAuditLogs(pipelineId, limit = 50, offset = 0) {
    try {
        return await pipeline_audit_log_repository_1.PipelineAuditLogRepository.findByPipelineId(pipelineId, limit, offset);
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to get audit logs: ${error}`);
        throw error;
    }
}
/**
 * Get recent pipelines for dashboard
 */
async function getRecentPipelines(limit = 20, offset = 0) {
    try {
        return await release_pipeline_repository_1.ReleasePipelineRepository.getRecent(limit, offset);
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to get recent pipelines: ${error}`);
        throw error;
    }
}
/**
 * Delete old pipelines (cleanup)
 */
async function deleteOldPipelines(daysOld = 90) {
    try {
        const count = await release_pipeline_repository_1.ReleasePipelineRepository.deleteOld(daysOld);
        logger_1.AppLogger.info(`Deleted ${count} old pipelines`);
        return count;
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to delete old pipelines: ${error}`);
        throw error;
    }
}
