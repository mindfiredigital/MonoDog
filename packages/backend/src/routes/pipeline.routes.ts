import { Router } from 'express';
import {
  getPipelineAuditLogs,
  getPipelineDetails,
  getRecentPipelines,
  refreshPipelineFromRun,
  updatePipelineStatus,
} from '../controllers/pipeline.controller';
import {
  authenticationMiddleware,
  repositoryPermissionMiddleware,
} from '../middleware/auth-middleware';

const router = Router();

router.get('/', authenticationMiddleware, getRecentPipelines);
router.get('/:pipelineId', authenticationMiddleware, getPipelineDetails);
router.put(
  '/:pipelineId/status',
  authenticationMiddleware,
  repositoryPermissionMiddleware('write'),
  updatePipelineStatus
);
router.post(
  '/:pipelineId/refresh',
  authenticationMiddleware,
  refreshPipelineFromRun
);
router.get(
  '/:pipelineId/run-status',
  authenticationMiddleware,
  refreshPipelineFromRun
);
router.get(
  '/:pipelineId/audit-logs',
  authenticationMiddleware,
  getPipelineAuditLogs
);

export default router;
