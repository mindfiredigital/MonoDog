import { Router } from 'express';
import {
  cancelRepositoryWorkflowRun,
  getAvailableWorkflows,
  getRepositoryWorkflowRuns,
  getWorkflowJobLogs,
  getWorkflowRunDetails,
  rerunRepositoryWorkflowRun,
  triggerRepositoryWorkflow,
} from '../controllers/workflow.controller';
import {
  authenticationMiddleware,
  repositoryPermissionMiddleware,
} from '../middleware/auth-middleware';

const router = Router();

router.get(
  '/:owner/:repo/available',
  authenticationMiddleware,
  getAvailableWorkflows
);
router.get(
  '/:owner/:repo',
  authenticationMiddleware,
  getRepositoryWorkflowRuns
);
router.get(
  '/:owner/:repo/runs/:runId',
  authenticationMiddleware,
  getWorkflowRunDetails
);
router.get(
  '/:owner/:repo/jobs/:jobId/logs',
  authenticationMiddleware,
  getWorkflowJobLogs
);
router.post(
  '/:owner/:repo/trigger',
  authenticationMiddleware,
  repositoryPermissionMiddleware('maintain'),
  triggerRepositoryWorkflow
);
router.post(
  '/:owner/:repo/runs/:runId/cancel',
  authenticationMiddleware,
  repositoryPermissionMiddleware('maintain'),
  cancelRepositoryWorkflowRun
);
router.post(
  '/:owner/:repo/runs/:runId/rerun',
  authenticationMiddleware,
  repositoryPermissionMiddleware('maintain'),
  rerunRepositoryWorkflowRun
);

export default router;
