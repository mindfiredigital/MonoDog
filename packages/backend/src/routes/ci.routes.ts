import { Router } from 'express';
import {
  getMonorepoCIStatus,
  getPackageCIStatus,
  triggerCIBuild,
  getBuildLogs,
  getBuildArtifacts,
  cancelPipeline,
  retryPipeline,
  togglePipeline,
  getAvailableWorkflows,
} from '../controllers/ci.controller';
import { authenticationMiddleware } from '../middleware/auth-middleware';

const router = Router();

router.get(
  '/workflows/available',
  authenticationMiddleware,
  getAvailableWorkflows
);
router.get('/status', authenticationMiddleware, getMonorepoCIStatus);
router.get('/packages/:name', authenticationMiddleware, getPackageCIStatus);
router.post('/trigger', authenticationMiddleware, triggerCIBuild);
router.get('/builds/:buildId/logs', authenticationMiddleware, getBuildLogs);
router.get(
  '/builds/:buildId/artifacts',
  authenticationMiddleware,
  getBuildArtifacts
);

router.post(
  '/pipelines/:buildId/cancel',
  authenticationMiddleware,
  cancelPipeline
);
router.post(
  '/pipelines/:buildId/retry',
  authenticationMiddleware,
  retryPipeline
);
router.post(
  '/pipelines/:pipelineId/toggle',
  authenticationMiddleware,
  togglePipeline
);

export default router;
