/**
 * GitHub Actions and Release Pipeline Routes
 */
import express from 'express';
import { authenticationMiddleware } from '../middleware/auth-middleware';
import {
  getRecentPipelines,
  updatePipelineStatus,
  getPipelineAuditLogs
} from '../controllers/pipeline-controller';

const pipelineRouter = express.Router();

/**
 * GET /api/pipelines
 * Get recent pipelines for the dashboard
 */
pipelineRouter.get('/', authenticationMiddleware, getRecentPipelines);

/**
 * PUT /api/pipelines/:pipelineId/status
 * Update pipeline status based on latest workflow run
 */
pipelineRouter.put(
  '/:pipelineId/status',
  authenticationMiddleware,
  updatePipelineStatus
);

/**
 * GET /api/pipelines/:pipelineId/audit-logs
 * Get audit logs for a pipeline
 */
pipelineRouter.get(
  '/:pipelineId/audit-logs',
  authenticationMiddleware,
  getPipelineAuditLogs
);

export default pipelineRouter;


