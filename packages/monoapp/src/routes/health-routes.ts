import express from 'express';
import { getPackagesHealth, refreshHealth } from '../controllers/health-controller';

const healthRouter = express.Router();

healthRouter
  .route('/refresh')
  .post(refreshHealth);

healthRouter
  .route('/packages')
  .get(getPackagesHealth);

export default healthRouter;
