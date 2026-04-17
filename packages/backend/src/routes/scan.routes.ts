import { Router } from 'express';
import {
  performScan,
  getScanResults,
  exportScanResults,
} from '../controllers/scan.controller';

const router = Router();

router.post('/', performScan);
router.get('/results', getScanResults);
router.get('/export/:format', exportScanResults);

export default router;
