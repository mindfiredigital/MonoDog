import express from 'express';
import { getPackagesHealth, refreshHealth } from '../controllers/health-controller';

const healthRouter = express.Router();

healthRouter
  .route('/refresh')
  .get(refreshHealth);

healthRouter
  .route('/packages')
  .get(getPackagesHealth);

export default healthRouter;
