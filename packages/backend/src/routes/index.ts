import { Router } from 'express';
import packagesRoutes from './packages.routes';
import healthRoutes from './health.routes';
import ciRoutes from './ci.routes';
import scanRoutes from './scan.routes';
import configRoutes from './config.routes';
import commitsRoutes from './commits.routes';
import searchRoutes from './search.routes';
import activityRoutes from './activity.routes';
import authRoutes from './auth.routes';
import pipelineRoutes from './pipeline.routes';
import workflowRoutes from './workflow.routes';
import { getSystemInfo, getStats } from '../controllers/system.controller';

const router = Router();

router.use('/auth', authRoutes);
router.use('/packages', packagesRoutes);
router.use('/health', healthRoutes);
router.use('/ci', ciRoutes);
router.use('/scan', scanRoutes);
router.use('/config', configRoutes);
router.use('/commits', commitsRoutes);
router.use('/search', searchRoutes);
router.use('/activity', activityRoutes);
router.use('/pipelines', pipelineRoutes);
router.use('/workflows', workflowRoutes);

router.get('/system', getSystemInfo);
router.get('/stats', getStats);

export default router;
