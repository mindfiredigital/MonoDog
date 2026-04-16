import { Router } from 'express';
import {
  getPackages,
  refreshPackages,
  getPackageDetails,
  updatePackage,
} from '../controllers/packages.controller';

const router = Router();

router.get('/refresh', refreshPackages);
router.get('/', getPackages);
router.get('/:name', getPackageDetails);
router.put('/update', updatePackage);

export default router;
