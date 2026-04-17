import { Router } from 'express';
import {
  getConfigFiles,
  updateConfigFile,
} from '../controllers/config.controller';

const router = Router();

router.get('/files', getConfigFiles);
router.put('/files/:id', updateConfigFile);

export default router;
