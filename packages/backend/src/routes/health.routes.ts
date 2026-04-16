import { Router } from 'express';
import {
  getHealth,
  getPackageHealth,
  getAllPackagesHealth,
  refreshHealth,
} from '../controllers/health.controller';

const router = Router();

router.get('/', getHealth);
router.get('/refresh', refreshHealth);
router.get('/packages', getAllPackagesHealth);
router.get('/packages/:name', getPackageHealth);

export default router;
