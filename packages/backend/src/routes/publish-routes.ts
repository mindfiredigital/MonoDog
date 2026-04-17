import express from 'express';
import {
  getPublishPackages,
  getPublishChangesets,
  previewPublish,
  createChangeset,
  checkPublishStatus,
  triggerPublish,
} from '../controllers/publish-controller';
import {
  authenticationMiddleware,
  repositoryPermissionMiddleware,
} from '../middleware/auth-middleware';

const publishRouter = express.Router();

/**
 * GET /api/publish/packages
 * Get all workspace packages for publishing
 * Requires: read permission
 */
publishRouter.get('/packages', authenticationMiddleware, getPublishPackages);

/**
 * GET /api/publish/changesets
 * Get existing unpublished changesets
 * Requires: read permission
 */
publishRouter.get(
  '/changesets',
  authenticationMiddleware,
  getPublishChangesets
);

/**
 * POST /api/publish/preview
 * Preview the publish plan (calculate new versions, affected packages)
 * Requires: read permission
 */
publishRouter.post('/preview', authenticationMiddleware, previewPublish);

/**
 * POST /api/publish/changesets
 * Create a new changeset for the selected packages
 * Requires: write permission
 */
publishRouter.post(
  '/changesets',
  authenticationMiddleware,
  repositoryPermissionMiddleware('write'),
  createChangeset
);

/**
 * GET /api/publish/status
 * Check publish readiness (working tree, changesets, etc.)
 * Requires: read permission
 */
publishRouter.get('/status', authenticationMiddleware, checkPublishStatus);

/**
 * POST /api/publish/trigger
 * Trigger the publishing workflow
 * Requires: maintain permission
 */
publishRouter.post(
  '/trigger',
  authenticationMiddleware,
  repositoryPermissionMiddleware('maintain'),
  triggerPublish
);

export default publishRouter;
