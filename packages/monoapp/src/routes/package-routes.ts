import express from 'express';
import { getPackages, refreshPackages, getPackageDetail, updatePackageConfig } from '../controllers/package-controller';

const packageRouter = express.Router();

packageRouter
  .route('/refresh')
  .post(refreshPackages);

packageRouter
  .route('/update-config')
  .put(updatePackageConfig);

// Alias for /update-config to support both endpoint names
// packageRouter
//   .route('/update')
//   .put(updatePackageConfig);

packageRouter
  .route('/:name')
  .get(getPackageDetail);

packageRouter
  .route('/')
  .get(getPackages);

export default packageRouter;
