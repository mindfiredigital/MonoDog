import { Router } from 'express';
import {
  getHealth,
  getPackageHealth,
  getAllPackagesHealth,
  refreshHealth,
  getLiveStatus,
} from '../controllers/health.controller';

const router = Router();

router.get('/live', getLiveStatus);
router.get('/', getHealth);
router.post('/refresh', refreshHealth);
router.get('/packages', getAllPackagesHealth);
router.get('/packages/:name', getPackageHealth);

export default router;
