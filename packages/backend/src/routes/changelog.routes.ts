import { Router } from 'express';
import { getChangelog } from '../controllers/changelog.controller';
import {
  repositoryPermissionMiddleware,
  authenticationMiddleware,
} from '../middleware/auth-middleware';

const router = Router();

router.get(
  '/:packageName',
  authenticationMiddleware,
  repositoryPermissionMiddleware('read'),
  getChangelog
);

export default router;
