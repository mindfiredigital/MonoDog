import express from 'express';
import { getPackages, refreshPackages, getPackageDetail, updatePackageConfig } from '../controllers/packageController';

const packageRouter = express.Router();

packageRouter
  .route('/refresh')
  .get(refreshPackages);

packageRouter
  .route('/update-config')
  .put(updatePackageConfig);

packageRouter
  .route('/:name')
  .get(getPackageDetail);

packageRouter
  .route('/')
  .get(getPackages);

export default packageRouter;
