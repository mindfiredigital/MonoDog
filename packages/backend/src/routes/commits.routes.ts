import { Router } from 'express';
import { getCommits } from '../controllers/commits.controller';

const router = Router();

router.get('/:packagePath', getCommits);

export default router;
