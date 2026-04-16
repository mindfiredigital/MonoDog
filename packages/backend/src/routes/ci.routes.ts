import { Router } from 'express';
import {
  getMonorepoCIStatus,
  getPackageCIStatus,
  triggerCIBuild,
  getBuildLogs,
  getBuildArtifacts,
} from '../controllers/ci.controller';

const router = Router();

router.get('/status', getMonorepoCIStatus);
router.get('/packages/:name', getPackageCIStatus);
router.post('/trigger', triggerCIBuild);
router.get('/builds/:buildId/logs', getBuildLogs);
router.get('/builds/:buildId/artifacts', getBuildArtifacts);

export default router;
