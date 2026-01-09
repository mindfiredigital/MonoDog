import express from 'express';
import { getCommitsByPath } from '../controllers/commitController';

const commitRouter = express.Router();

commitRouter
  .route('/:packagePath')
  .get(getCommitsByPath);

export default commitRouter;
