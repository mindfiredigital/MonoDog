import { Router } from 'express';
import {
  getMonorepoCIStatus,
  getPackageCIStatus,
  triggerCIBuild,
  getBuildLogs,
  getBuildArtifacts,
} from '../controllers/ci.controller';
import { authenticationMiddleware } from '../middleware/auth-middleware';

const router = Router();

router.get('/status', authenticationMiddleware, getMonorepoCIStatus);
router.get('/packages/:name', authenticationMiddleware, getPackageCIStatus);
router.post('/trigger', authenticationMiddleware, triggerCIBuild);
router.get('/builds/:buildId/logs', authenticationMiddleware, getBuildLogs);
router.get(
  '/builds/:buildId/artifacts',
  authenticationMiddleware,
  getBuildArtifacts
);

export default router;
