/**
 * Permission Controller
 * Thin controller that handles HTTP concerns and delegates business logic to permission-service
 */

import { Request, Response } from 'express';
import { getSessionFromRequest } from '../middleware/auth-middleware';
import {
  checkRepositoryPermission,
  checkUserAction,
  invalidatePermissionCache,
} from '../services/permission-service';
import { AppLogger } from '../middleware/logger';

/**
 * Get user's permission for a specific repository
 * GET /permissions/:owner/:repo
 */
export const getRepositoryPermission = async (
  req: Request,
  res: Response
) => {
  try {
    const session = getSessionFromRequest(req);

    if (!session) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No active session',
      });
      return;
    }

    const { owner, repo } = req.params;
    const forceRefresh = req.query.refresh === 'true';

    if (!owner || !repo) {
      res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Owner and repo parameters are required',
      });
      return;
    }

    AppLogger.debug(
      `Checking permission for ${session.user.login} in ${owner}/${repo}`
    );

    const permissionCheck = await checkRepositoryPermission(
      session.accessToken,
      session.user.id,
      session.user.login,
      owner,
      repo,
      forceRefresh
    );

    res.json({
      success: true,
      owner,
      repo,
      user: session.user.login,
      ...permissionCheck,
    });
  } catch (error) {
    AppLogger.error(`Failed to check permission: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to check repository permission',
    });
  }
};

/**
 * Check if user can perform a specific action
 * POST /permissions/:owner/:repo/can-action
 */
export const checkActionPermission = async (req: Request, res: Response) => {
  try {
    const session = getSessionFromRequest(req);

    if (!session) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No active session',
      });
      return;
    }

    const { owner, repo } = req.params;
    const { action } = req.body;

    if (!owner || !repo) {
      res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Owner and repo parameters are required',
      });
      return;
    }

    if (!action || !['read', 'write', 'maintain', 'admin'].includes(action)) {
      res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Valid action is required (read, write, maintain, or admin)',
      });
      return;
    }

    AppLogger.debug(
      `Checking if ${session.user.login} can perform '${action}' in ${owner}/${repo}`
    );

    const actionCheck = await checkUserAction(
      session.accessToken,
      session.user.id,
      session.user.login,
      owner,
      repo,
      action as 'read' | 'write' | 'maintain' | 'admin'
    );

    res.json({
      success: true,
      owner,
      repo,
      user: session.user.login,
      ...actionCheck,
    });
  } catch (error) {
    AppLogger.error(`Failed to check action permission: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to check action permission',
    });
  }
};

/**
 * Invalidate permission cache for a repository
 * POST /permissions/:owner/:repo/invalidate
 */
export const invalidateCache = (req: Request, res: Response) => {
  try {
    const session = getSessionFromRequest(req);

    if (!session) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No active session',
      });
      return;
    }

    const { owner, repo } = req.params;

    if (!owner || !repo) {
      res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Owner and repo parameters are required',
      });
      return;
    }

    AppLogger.debug(
      `Invalidating permission cache for ${session.user.login} in ${owner}/${repo}`
    );

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
};
