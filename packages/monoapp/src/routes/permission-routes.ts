/**
 * Repository Permission Routes
 * Handles checking and managing repository permissions
 */

import { Router } from 'express';
import { authenticationMiddleware } from '../middleware/auth-middleware';
import {
  getRepositoryPermission,
  checkActionPermission,
  invalidateCache,
} from '../controllers/permission-controller';

const router = Router();

/**
 * Get user's permission for a specific repository
 * GET /permissions/:owner/:repo
 */
router.get('/:owner/:repo', authenticationMiddleware, getRepositoryPermission);

/**
 * Check if user can perform a specific action
 * POST /permissions/:owner/:repo/can-action
 */
router.post(
  '/:owner/:repo/can-action',
  authenticationMiddleware,
  checkActionPermission
);

/**
 * Invalidate permission cache for a repository
 * POST /permissions/:owner/:repo/invalidate
 */
router.post(
  '/:owner/:repo/invalidate',
  authenticationMiddleware,
  invalidateCache
);

export default router;
