/**
 * Workflow Routes
 */
import express from 'express';
import { authenticationMiddleware } from '../middleware/auth-middleware';
import {
  listAvailableWorkflows,
  getWorkflowRuns,
  getWorkflowRunWithJobs,
  getJobLogs,
  triggerWorkflow,
  cancelWorkflowRun,
  rerunWorkflow,
} from '../controllers/pipeline-controller';

const workflowRouter = express.Router();

/**
 * GET /api/workflows/:owner/:repo/available
 * List available workflows in a repository
 */
workflowRouter.get(
  '/:owner/:repo/available',
  authenticationMiddleware,
  listAvailableWorkflows
);

/**
 * GET /api/workflows/:owner/:repo
 * Get workflow runs for a repository
 */
workflowRouter.get(
  '/:owner/:repo',
  authenticationMiddleware,
  getWorkflowRuns,
);

/**
 * GET /api/workflows/:owner/:repo/runs/:runId
 * Get specific workflow run with jobs
 */
workflowRouter.get(
  '/:owner/:repo/runs/:runId',
  authenticationMiddleware,
  getWorkflowRunWithJobs
);

/**
 * GET /api/workflows/:owner/:repo/jobs/:jobId/logs
 * Get logs for a job
 */
workflowRouter.get(
  '/:owner/:repo/jobs/:jobId/logs',
  authenticationMiddleware,
  getJobLogs
);

/**
 * POST /api/workflows/:owner/:repo/trigger
 * Trigger a workflow
 * Requires: maintain permission
 */
workflowRouter.post(
  '/:owner/:repo/trigger',
  authenticationMiddleware,
  triggerWorkflow
);

/**
 * POST /api/workflows/:owner/:repo/runs/:runId/cancel
 * Cancel a workflow run
 * Requires: maintain permission
 */
workflowRouter.post(
  '/:owner/:repo/runs/:runId/cancel',
  authenticationMiddleware,
  cancelWorkflowRun
);

/**
 * POST /api/workflows/:owner/:repo/runs/:runId/rerun
 * Re-run a workflow
 * Requires: maintain permission
 */
workflowRouter.post(
  '/:owner/:repo/runs/:runId/rerun',
  authenticationMiddleware,
  rerunWorkflow
);

export default workflowRouter;


