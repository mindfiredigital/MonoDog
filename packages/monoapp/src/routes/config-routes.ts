import express from 'express';
import { getConfigurationFiles, updateConfigFile } from '../controllers/config-controller';

const configRouter = express.Router();

configRouter
  .route('/files')
  .get(getConfigurationFiles);

configRouter
  .route('/files/:id')
  .put(updateConfigFile);

export default configRouter;
