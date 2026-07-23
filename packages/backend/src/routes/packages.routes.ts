import { Router } from 'express';
import {
  getPackages,
  refreshPackages,
  getPackageDetails,
  updatePackage,
  syncNpmData,
} from '../controllers/packages.controller';

const router = Router();

router.post('/sync-npm', syncNpmData);
router.get('/refresh', refreshPackages);
router.get('/', getPackages);
router.get('/:name', getPackageDetails);
router.put('/update', updatePackage);

export default router;
