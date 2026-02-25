/**
 * Repository Permission Routes
 * Handles checking and managing repository permissions
 */

import { Request, Response, Router } from 'express';
import type { PermissionCheckResponse } from '../types/auth';
import {
  authenticationMiddleware,
  getSessionFromRequest,
} from '../middleware/auth-middleware';
import {
  getUserRepositoryPermission,
  invalidatePermissionCache,
  canPerformAction,
} from '../services/permission-service';
import { AppLogger } from '../middleware/logger';

const router = Router();

/**
 * Get user's permission for a specific repository
 * GET /permissions/:owner/:repo
 */
router.get(
  '/:owner/:repo',
  authenticationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);

      if (!session) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'No active session',
        });
        return;
      }

      const { owner, repo } = req.params;
      const forceRefresh = req.query.refresh === 'true';

      if (!owner || !repo) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Owner and repo parameters are required',
        });
        return;
      }

      AppLogger.debug(
        `Checking permission for ${session.user.login} in ${owner}/${repo}`
      );

      // Get permission from cache or GitHub API
      const cachedPermission = await getUserRepositoryPermission(
        session.accessToken,
        session.user.id,
        session.user.login,
        owner,
        repo,
        forceRefresh
      );

      const response: PermissionCheckResponse = {
        permission: cachedPermission.permission,
        role: cachedPermission.role,
        canAdmin: cachedPermission.permission === 'admin',
        canMaintain: canPerformAction(cachedPermission.permission, 'maintain'),
        canWrite: canPerformAction(cachedPermission.permission, 'write'),
        canRead: canPerformAction(cachedPermission.permission, 'read'),
        denied: cachedPermission.permission === 'none',
      };

      res.json({
        success: true,
        owner,
        repo,
        user: session.user.login,
        ...response,
      });
    } catch (error) {
      AppLogger.error(`Failed to check permission: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to check repository permission',
      });
    }
  }
);

/**
 * Check if user can perform a specific action
 * POST /permissions/:owner/:repo/can-action
 */
router.post(
  '/:owner/:repo/can-action',
  authenticationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);

      if (!session) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'No active session',
        });
        return;
      }

      const { owner, repo } = req.params;
      const { action } = req.body;

      if (!owner || !repo) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Owner and repo parameters are required',
        });
        return;
      }

      if (!action || !['read', 'write', 'maintain', 'admin'].includes(action)) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Valid action is required (read, write, maintain, or admin)',
        });
        return;
      }

      AppLogger.debug(
        `Checking if ${session.user.login} can perform '${action}' in ${owner}/${repo}`
      );

      // Get permission
      const cachedPermission = await getUserRepositoryPermission(
        session.accessToken,
        session.user.id,
        session.user.login,
        owner,
        repo
      );

      // Check if user can perform action
      const can = canPerformAction(cachedPermission.permission, action);

      res.json({
        success: true,
        owner,
        repo,
        user: session.user.login,
        action,
        can,
        permission: cachedPermission.permission,
        role: cachedPermission.role,
      });
    } catch (error) {
      AppLogger.error(`Failed to check action permission: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to check action permission',
      });
    }
  }
);

/**
 * Invalidate permission cache for a repository
 * POST /permissions/:owner/:repo/invalidate
 */
router.post(
  '/:owner/:repo/invalidate',
  authenticationMiddleware,
  (req: Request, res: Response) => {
    try {
      const session = getSessionFromRequest(req);

      if (!session) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'No active session',
        });
        return;
      }

      const { owner, repo } = req.params;

      if (!owner || !repo) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Owner and repo parameters are required',
        });
        return;
      }

      AppLogger.debug(
        `Invalidating permission cache for ${session.user.login} in ${owner}/${repo}`
      );

      // Invalidate cache
      invalidatePermissionCache(session.user.id, owner, repo);

      res.json({
        success: true,
        message: 'Permission cache invalidated',
        owner,
        repo,
        user: session.user.login,
      });
    } catch (error) {
      AppLogger.error(`Failed to invalidate cache: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to invalidate permission cache',
      });
    }
  }
);

export default router;
