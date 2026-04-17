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
import {
  AUTH_ERRORS,
  VALIDATION_ERRORS,
  OPERATION_ERRORS,
} from '../constants/error-messages';
import {
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} from '../constants/http';

/**
 * Get user's permission for a specific repository
 * GET /permissions/:owner/:repo
 */
export const getRepositoryPermission = async (req: Request, res: Response) => {
  try {
    const session = getSessionFromRequest(req);

    if (!session) {
      res.status(HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        error: AUTH_ERRORS.UNAUTHORIZED,
        message: AUTH_ERRORS.SESSION_NOT_FOUND,
      });
      return;
    }

    const { owner, repo } = req.params;
    const forceRefresh = req.query.refresh === 'true';

    if (!owner || !repo) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.INVALID_REQUEST,
        message: VALIDATION_ERRORS.INVALID_REQUEST,
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
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
      message: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
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
      res.status(HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        error: AUTH_ERRORS.UNAUTHORIZED,
        message: AUTH_ERRORS.SESSION_NOT_FOUND,
      });
      return;
    }

    const { owner, repo } = req.params;
    const { action } = req.body;

    if (!owner || !repo) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.INVALID_REQUEST,
        message: VALIDATION_ERRORS.INVALID_REQUEST,
      });
      return;
    }

    if (!action || !['read', 'write', 'maintain', 'admin'].includes(action)) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.INVALID_REQUEST,
        message: VALIDATION_ERRORS.INVALID_REQUEST,
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
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
      message: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
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
      res.status(HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        error: AUTH_ERRORS.UNAUTHORIZED,
        message: AUTH_ERRORS.SESSION_NOT_FOUND,
      });
      return;
    }

    const { owner, repo } = req.params;

    if (!owner || !repo) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.INVALID_REQUEST,
        message: VALIDATION_ERRORS.INVALID_REQUEST,
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
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
      message: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
    });
  }
};
