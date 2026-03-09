"use strict";
/**
 * Authentication Controller
 * Thin controller that handles HTTP concerns and delegates business logic to auth-service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.logout = exports.validate = exports.me = exports.callback = exports.login = void 0;
const auth_service_1 = require("../services/auth-service");
const logger_1 = require("../middleware/logger");
const constants_1 = require("../constants");
/**
 * Start OAuth login flow
 * GET /auth/login
 */
const login = (req, res) => {
    try {
        const redirectUrl = req.query.redirect || '/';
        const result = (0, auth_service_1.initiateLogin)(redirectUrl);
        res.json({
            success: true,
            authUrl: result.authUrl,
            message: constants_1.AUTH_MESSAGES.LOGIN_INITIATED,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Login initiation failed: ${error}`);
        res.status(constants_1.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            error: constants_1.AUTH_ERRORS.LOGIN_FAILED,
            message: error instanceof Error ? error.message : constants_1.AUTH_ERRORS.LOGIN_INITIATION_FAILED,
        });
    }
};
exports.login = login;
/**
 * OAuth callback handler
 * GET /auth/callback?code=...&state=...
 */
const callback = async (req, res) => {
    try {
        const { code, state, error, error_description } = req.query;
        // Handle OAuth errors from GitHub
        if (error) {
            logger_1.AppLogger.warn(`OAuth error: ${error} - ${error_description}`);
            res.status(constants_1.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                error: error,
                message: error_description,
            });
            return;
        }
        if (!code || !state) {
            logger_1.AppLogger.warn('OAuth callback missing code or state');
            res.status(constants_1.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                error: constants_1.AUTH_ERRORS.MISSING_PARAMETERS,
                message: constants_1.AUTH_ERRORS.MISSING_CODE_OR_STATE,
            });
            return;
        }
        const result = await (0, auth_service_1.handleOAuthCallback)(code, state);
        res.json({
            success: true,
            message: constants_1.AUTH_MESSAGES.AUTHENTICATION_SUCCESSFUL,
            ...result,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`OAuth callback failed: ${error}`);
        const message = error instanceof Error ? error.message : constants_1.AUTH_ERRORS.GITHUB_OAUTH_FAILED;
        if (message.includes('CSRF')) {
            res.status(constants_1.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                error: constants_1.AUTH_ERRORS.INVALID_STATE,
                message,
            });
        }
        else {
            res.status(constants_1.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                success: false,
                error: constants_1.AUTH_ERRORS.LOGIN_FAILED,
                message,
            });
        }
    }
};
exports.callback = callback;
/**
 * Get current user session
 * GET /auth/me
 */
const me = (req, res) => {
    try {
        const session = (0, auth_service_1.getCurrentSession)(req);
        res.json({
            success: true,
            ...session,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to get user session: ${error}`);
        res.status(constants_1.HTTP_STATUS_UNAUTHORIZED).json({
            success: false,
            error: constants_1.AUTH_ERRORS.TOKEN_REQUIRED,
            message: error instanceof Error ? error.message : constants_1.AUTH_ERRORS.SESSION_NOT_FOUND,
        });
    }
};
exports.me = me;
/**
 * Validate session
 * POST /auth/validate
 */
const validate = async (req, res) => {
    try {
        const result = await (0, auth_service_1.validateCurrentSession)(req);
        res.json({
            success: true,
            ...result,
            message: constants_1.AUTH_MESSAGES.SESSION_VALID,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Session validation failed: ${error}`);
        if (error instanceof Error && error.message.includes('no longer valid')) {
            res.status(constants_1.HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                valid: false,
                error: constants_1.AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION,
                message: error.message,
            });
        }
        else {
            res.status(constants_1.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                success: false,
                valid: false,
                error: constants_1.AUTH_ERRORS.SESSION_NOT_FOUND,
                message: error instanceof Error ? error.message : constants_1.AUTH_ERRORS.SESSION_NOT_FOUND,
            });
        }
    }
};
exports.validate = validate;
/**
 * Logout
 * POST /auth/logout
 */
const logout = (req, res) => {
    try {
        (0, auth_service_1.logoutUser)(req);
        res.json({
            success: true,
            message: constants_1.AUTH_MESSAGES.LOGOUT_SUCCESSFUL,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Logout failed: ${error}`);
        res.status(constants_1.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            error: constants_1.AUTH_ERRORS.LOGIN_FAILED,
            message: error instanceof Error ? error.message : constants_1.AUTH_ERRORS.LOGIN_FAILED,
        });
    }
};
exports.logout = logout;
/**
 * Refresh session (token)
 * POST /auth/refresh
 */
const refresh = async (req, res) => {
    try {
        const result = await (0, auth_service_1.refreshUserSession)(req);
        res.json({
            success: true,
            message: constants_1.AUTH_MESSAGES.SESSION_REFRESHED,
            ...result,
        });
    }
    catch (error) {
        logger_1.AppLogger.error(`Session refresh failed: ${error}`);
        if (error instanceof Error && error.message.includes('no longer valid')) {
            res.status(constants_1.HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                error: constants_1.AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION,
                message: error.message,
            });
        }
        else {
            res.status(constants_1.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                success: false,
                error: constants_1.AUTH_ERRORS.SESSION_NOT_FOUND,
                message: error instanceof Error ? error.message : constants_1.AUTH_ERRORS.SESSION_NOT_FOUND,
            });
        }
    }
};
exports.refresh = refresh;
