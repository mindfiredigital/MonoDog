import express from 'express';
import { getCommitsByPath } from '../controllers/commit-controller';

const commitRouter = express.Router();

commitRouter
  .route('/:packagePath')
  .get(getCommitsByPath);

export default commitRouter;
