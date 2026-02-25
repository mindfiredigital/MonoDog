"use strict";
/**
 * Authentication Middleware
 * Handles session validation and permission checks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSessionToken = generateSessionToken;
exports.storeSession = storeSession;
exports.getSession = getSession;
exports.invalidateSession = invalidateSession;
exports.authenticationMiddleware = authenticationMiddleware;
exports.repositoryPermissionMiddleware = repositoryPermissionMiddleware;
exports.getSessionFromRequest = getSessionFromRequest;
exports.isAuthenticated = isAuthenticated;
exports.clearExpiredSessions = clearExpiredSessions;
exports.getSessionStats = getSessionStats;
exports.initializeAuthentication = initializeAuthentication;
const logger_1 = require("./logger");
// Store sessions in memory (should be replaced with proper session store in production)
const sessionStore = new Map();
const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
/**
 * Generate session token
 */
function generateSessionToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}
/**
 * Store session
 */
function storeSession(session) {
    const token = generateSessionToken();
    sessionStore.set(token, session);
    // Set expiration timeout
    setTimeout(() => {
        sessionStore.delete(token);
        logger_1.AppLogger.debug(`Session expired: ${session.user.login}`);
    }, sessionTimeout);
    logger_1.AppLogger.debug(`Session stored for user: ${session.user.login}`);
    return token;
}
/**
 * Get session by token
 */
function getSession(token) {
    const session = sessionStore.get(token);
    if (!session) {
        return null;
    }
    // Check if session has expired based on expiresAt
    if (Date.now() > session.expiresAt) {
        sessionStore.delete(token);
        logger_1.AppLogger.warn(`Session token expired: ${token.substring(0, 10)}...`);
        return null;
    }
    return session;
}
/**
 * Invalidate session
 */
function invalidateSession(token) {
    sessionStore.delete(token);
    logger_1.AppLogger.debug(`Session invalidated: ${token.substring(0, 10)}...`);
}
/**
 * Middleware to verify authentication
 */
function authenticationMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '') ||
        req.cookies?.['auth-token'];
    if (!token) {
        logger_1.AppLogger.warn(`Unauthorized request to ${req.path}: no auth token`);
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication token required',
        });
        return;
    }
    const session = getSession(token);
    if (!session) {
        logger_1.AppLogger.warn(`Unauthorized request to ${req.path}: invalid session`);
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired session',
        });
        return;
    }
    // Attach session and user info to request
    req.session = session;
    req.user = {
        login: session.user.login,
        id: session.user.id,
    };
    req.accessToken = session.accessToken;
    // Attach permission from session (if available)
    if (session.permission) {
        req.permission = session.permission;
    }
    else {
        // Default to 'read' if no permission fetched
        req.permission = {
            permission: 'read',
            role: 'Denied',
            userId: session.user.id,
            username: session.user.login,
            owner: '',
            repo: '',
            cachedAt: Date.now(),
            ttl: 0,
        };
    }
    logger_1.AppLogger.debug(`Authenticated request from user: ${session.user.login} with permission: ${req.permission?.permission || 'unknown'}`);
    next();
}
/**
 * Middleware to verify repository permission
 */
function repositoryPermissionMiddleware(requiredPermission) {
    return (req, res, next) => {
        const authReq = req;
        const session = authReq.session;
        if (!session) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Session not found',
            });
            return;
        }
        const permission = authReq.permission;
        if (!permission) {
            res.status(403).json({
                error: 'Forbidden',
                message: 'Permission not resolved for repository',
            });
            return;
        }
        const permissionHierarchy = {
            admin: 4,
            maintain: 3,
            write: 2,
            read: 1,
            none: 0,
        };
        // Handle both string and object formats for permission
        const userPermissionString = typeof permission === 'string' ? permission : (permission.permission || 'none');
        const userLevel = permissionHierarchy[userPermissionString] || 0;
        const requiredLevel = permissionHierarchy[requiredPermission] || 0;
        if (userLevel < requiredLevel) {
            logger_1.AppLogger.warn(`User ${session.user.login} lacks permission for action requiring ${requiredPermission} (has ${userPermissionString})`);
            res.status(403).json({
                error: 'Forbidden',
                message: `This action requires ${requiredPermission} permission`,
            });
            return;
        }
        next();
    };
}
/**
 * Get session from request
 */
function getSessionFromRequest(req) {
    return req.session || null;
}
/**
 * Check if user is authenticated
 */
function isAuthenticated(req) {
    return !!getSessionFromRequest(req);
}
/**
 * Clear expired sessions (should be called periodically)
 */
function clearExpiredSessions() {
    const now = Date.now();
    let clearedCount = 0;
    for (const [token, session] of sessionStore.entries()) {
        if (now > session.expiresAt) {
            sessionStore.delete(token);
            clearedCount++;
        }
    }
    if (clearedCount > 0) {
        logger_1.AppLogger.debug(`Cleared ${clearedCount} expired sessions`);
    }
}
/**
 * Get session statistics
 */
function getSessionStats() {
    return {
        activeSessions: sessionStore.size,
        maxSessions: 10000,
    };
}
/**
 * Initialize authentication (call on server startup)
 */
function initializeAuthentication() {
    // Periodically clear expired sessions
    setInterval(() => {
        clearExpiredSessions();
    }, 60 * 1000); // Every minute
    logger_1.AppLogger.info('Authentication system initialized');
}
