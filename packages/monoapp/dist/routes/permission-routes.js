"use strict";
/**
 * Repository Permission Routes
 * Handles checking and managing repository permissions
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth-middleware");
const permission_service_1 = require("../services/permission-service");
const logger_1 = require("../middleware/logger");
const router = (0, express_1.Router)();
/**
 * Get user's permission for a specific repository
 * GET /permissions/:owner/:repo
 */
router.get('/:owner/:repo', auth_middleware_1.authenticationMiddleware, async (req, res) => {
    try {
        const session = (0, auth_middleware_1.getSessionFromRequest)(req);
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
        logger_1.AppLogger.debug(`Checking permission for ${session.user.login} in ${owner}/${repo}`);
        // Get permission from cache or GitHub API
        const cachedPermission = await (0, permission_service_1.getUserRepositoryPermission)(session.accessToken, session.user.id, session.user.login, owner, repo, forceRefresh);
        const response = {
            permission: cachedPermission.permission,
            role: cachedPermission.role,
            canAdmin: cachedPermission.permission === 'admin',
            canMaintain: (0, permission_service_1.canPerformAction)(cachedPermission.permission, 'maintain'),
            canWrite: (0, permission_service_1.canPerformAction)(cachedPermission.permission, 'write'),
            canRead: (0, permission_service_1.canPerformAction)(cachedPermission.permission, 'read'),
            denied: cachedPermission.permission === 'none',
        };
        res.json({
            success: true,
            owner,
            repo,
            user: session.user.login,
            ...response,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to check permission: ${error}`);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to check repository permission',
        });
    }
});
/**
 * Check if user can perform a specific action
 * POST /permissions/:owner/:repo/can-action
 */
router.post('/:owner/:repo/can-action', auth_middleware_1.authenticationMiddleware, async (req, res) => {
    try {
        const session = (0, auth_middleware_1.getSessionFromRequest)(req);
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
        logger_1.AppLogger.debug(`Checking if ${session.user.login} can perform '${action}' in ${owner}/${repo}`);
        // Get permission
        const cachedPermission = await (0, permission_service_1.getUserRepositoryPermission)(session.accessToken, session.user.id, session.user.login, owner, repo);
        // Check if user can perform action
        const can = (0, permission_service_1.canPerformAction)(cachedPermission.permission, action);
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
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to check action permission: ${error}`);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to check action permission',
        });
    }
});
/**
 * Invalidate permission cache for a repository
 * POST /permissions/:owner/:repo/invalidate
 */
router.post('/:owner/:repo/invalidate', auth_middleware_1.authenticationMiddleware, (req, res) => {
    try {
        const session = (0, auth_middleware_1.getSessionFromRequest)(req);
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
        logger_1.AppLogger.debug(`Invalidating permission cache for ${session.user.login} in ${owner}/${repo}`);
        // Invalidate cache
        (0, permission_service_1.invalidatePermissionCache)(session.user.id, owner, repo);
        res.json({
            success: true,
            message: 'Permission cache invalidated',
            owner,
            repo,
            user: session.user.login,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to invalidate cache: ${error}`);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to invalidate permission cache',
        });
    }
});
exports.default = router;
