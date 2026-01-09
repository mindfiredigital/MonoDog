import express from 'express';
import { getConfigurationFiles, updateConfigFile } from '../controllers/configController';

const configRouter = express.Router();

configRouter
  .route('/files')
  .get(getConfigurationFiles);

configRouter
  .route('/files/:id')
  .put(updateConfigFile);

export default configRouter;
