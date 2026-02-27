"use strict";
/**
 * Permission Controller
 * Thin controller that handles HTTP concerns and delegates business logic to permission-service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = exports.checkActionPermission = exports.getRepositoryPermission = void 0;
const auth_middleware_1 = require("../middleware/auth-middleware");
const permission_service_1 = require("../services/permission-service");
const logger_1 = require("../middleware/logger");
const error_messages_1 = require("../constants/error-messages");
const http_1 = require("../constants/http");
/**
 * Get user's permission for a specific repository
 * GET /permissions/:owner/:repo
 */
const getRepositoryPermission = async (req, res) => {
    try {
        const session = (0, auth_middleware_1.getSessionFromRequest)(req);
        if (!session) {
            res.status(http_1.HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                error: error_messages_1.AUTH_ERRORS.UNAUTHORIZED,
                message: error_messages_1.AUTH_ERRORS.SESSION_NOT_FOUND,
            });
            return;
        }
        const { owner, repo } = req.params;
        const forceRefresh = req.query.refresh === 'true';
        if (!owner || !repo) {
            res.status(http_1.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                error: error_messages_1.VALIDATION_ERRORS.INVALID_REQUEST,
                message: error_messages_1.VALIDATION_ERRORS.INVALID_REQUEST,
            });
            return;
        }
        logger_1.AppLogger.debug(`Checking permission for ${session.user.login} in ${owner}/${repo}`);
        const permissionCheck = await (0, permission_service_1.checkRepositoryPermission)(session.accessToken, session.user.id, session.user.login, owner, repo, forceRefresh);
        res.json({
            success: true,
            owner,
            repo,
            user: session.user.login,
            ...permissionCheck,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to check permission: ${error}`);
        res.status(http_1.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error_messages_1.OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
            message: error_messages_1.OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
        });
    }
};
exports.getRepositoryPermission = getRepositoryPermission;
/**
 * Check if user can perform a specific action
 * POST /permissions/:owner/:repo/can-action
 */
const checkActionPermission = async (req, res) => {
    try {
        const session = (0, auth_middleware_1.getSessionFromRequest)(req);
        if (!session) {
            res.status(http_1.HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                error: error_messages_1.AUTH_ERRORS.UNAUTHORIZED,
                message: error_messages_1.AUTH_ERRORS.SESSION_NOT_FOUND,
            });
            return;
        }
        const { owner, repo } = req.params;
        const { action } = req.body;
        if (!owner || !repo) {
            res.status(http_1.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                error: error_messages_1.VALIDATION_ERRORS.INVALID_REQUEST,
                message: error_messages_1.VALIDATION_ERRORS.INVALID_REQUEST,
            });
            return;
        }
        if (!action || !['read', 'write', 'maintain', 'admin'].includes(action)) {
            res.status(http_1.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                error: error_messages_1.VALIDATION_ERRORS.INVALID_REQUEST,
                message: error_messages_1.VALIDATION_ERRORS.INVALID_REQUEST,
            });
            return;
        }
        logger_1.AppLogger.debug(`Checking if ${session.user.login} can perform '${action}' in ${owner}/${repo}`);
        const actionCheck = await (0, permission_service_1.checkUserAction)(session.accessToken, session.user.id, session.user.login, owner, repo, action);
        res.json({
            success: true,
            owner,
            repo,
            user: session.user.login,
            ...actionCheck,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to check action permission: ${error}`);
        res.status(http_1.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error_messages_1.OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
            message: error_messages_1.OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
        });
    }
};
exports.checkActionPermission = checkActionPermission;
/**
 * Invalidate permission cache for a repository
 * POST /permissions/:owner/:repo/invalidate
 */
const invalidateCache = (req, res) => {
    try {
        const session = (0, auth_middleware_1.getSessionFromRequest)(req);
        if (!session) {
            res.status(http_1.HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                error: error_messages_1.AUTH_ERRORS.UNAUTHORIZED,
                message: error_messages_1.AUTH_ERRORS.SESSION_NOT_FOUND,
            });
            return;
        }
        const { owner, repo } = req.params;
        if (!owner || !repo) {
            res.status(http_1.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                error: error_messages_1.VALIDATION_ERRORS.INVALID_REQUEST,
                message: error_messages_1.VALIDATION_ERRORS.INVALID_REQUEST,
            });
            return;
        }
        logger_1.AppLogger.debug(`Invalidating permission cache for ${session.user.login} in ${owner}/${repo}`);
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
        res.status(http_1.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error_messages_1.OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
            message: error_messages_1.OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
        });
    }
};
exports.invalidateCache = invalidateCache;
