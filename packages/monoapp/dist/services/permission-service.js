"use strict";
/**
 * Permission Service
 * Manages repository permission caching and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCacheCleanup = startCacheCleanup;
exports.getUserRepositoryPermission = getUserRepositoryPermission;
exports.invalidatePermissionCache = invalidatePermissionCache;
exports.invalidateUserCache = invalidateUserCache;
exports.clearAllCache = clearAllCache;
exports.getCacheStats = getCacheStats;
exports.canPerformAction = canPerformAction;
const github_oauth_service_1 = require("./github-oauth-service");
const logger_1 = require("../middleware/logger");
// Cache storage: key = `${userId}:${owner}/${repo}`
const permissionCache = new Map();
// Configuration
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 10000;
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
/**
 * Start periodic cleanup of expired cache entries
 */
function startCacheCleanup() {
    setInterval(() => {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, entry] of permissionCache.entries()) {
            if (now > entry.cachedAt + entry.ttl) {
                permissionCache.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            logger_1.AppLogger.debug(`Cleaned ${cleanedCount} expired permission cache entries`);
        }
    }, CLEANUP_INTERVAL);
}
/**
 * Generate cache key
 */
function getCacheKey(userId, owner, repo) {
    return `${userId}:${owner}/${repo}`;
}
/**
 * Get cached permission if still valid
 */
function getCachedPermission(userId, owner, repo) {
    const key = getCacheKey(userId, owner, repo);
    const cached = permissionCache.get(key);
    if (!cached) {
        return null;
    }
    const now = Date.now();
    if (now > cached.cachedAt + cached.ttl) {
        // Cache expired
        permissionCache.delete(key);
        logger_1.AppLogger.debug(`Cache expired for ${key}`);
        return null;
    }
    return cached;
}
/**
 * Set permission in cache
 */
function setCachedPermission(userId, username, owner, repo, permission, ttl = DEFAULT_TTL) {
    const role = (0, github_oauth_service_1.mapPermissionToRole)(permission);
    const cached = {
        userId,
        username,
        owner,
        repo,
        permission,
        role,
        cachedAt: Date.now(),
        ttl,
    };
    const key = getCacheKey(userId, owner, repo);
    // Check cache size and evict oldest if needed
    if (permissionCache.size >= MAX_CACHE_SIZE) {
        let oldestKey = '';
        let oldestTime = Date.now();
        for (const [k, entry] of permissionCache.entries()) {
            if (entry.cachedAt < oldestTime) {
                oldestTime = entry.cachedAt;
                oldestKey = k;
            }
        }
        if (oldestKey) {
            permissionCache.delete(oldestKey);
            logger_1.AppLogger.debug(`Evicted oldest cache entry: ${oldestKey}`);
        }
    }
    permissionCache.set(key, cached);
    logger_1.AppLogger.debug(`Cached permission for ${key}: ${permission}`);
    return cached;
}
/**
 * Get user's permission for a repository
 * Checks cache first, then queries GitHub API if needed
 */
async function getUserRepositoryPermission(accessToken, userId, username, owner, repo, forceRefresh = false) {
    // Check cache if not forcing refresh
    if (!forceRefresh) {
        const cached = getCachedPermission(userId, owner, repo);
        if (cached) {
            return cached;
        }
    }
    // Query GitHub API
    logger_1.AppLogger.debug(`Querying GitHub API for ${username}'s permission in ${owner}/${repo}`);
    try {
        const response = await (0, github_oauth_service_1.getRepositoryPermission)(accessToken, owner, repo, username);
        return setCachedPermission(userId, username, owner, repo, response.permission);
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to get repository permission: ${error}`);
        // Return 'none' permission on error
        return setCachedPermission(userId, username, owner, repo, 'none');
    }
}
/**
 * Invalidate permission cache for a user-repository pair
 */
function invalidatePermissionCache(userId, owner, repo) {
    const key = getCacheKey(userId, owner, repo);
    permissionCache.delete(key);
    logger_1.AppLogger.debug(`Invalidated cache for ${key}`);
}
/**
 * Invalidate all permissions for a user
 */
function invalidateUserCache(userId) {
    let invalidatedCount = 0;
    for (const key of permissionCache.keys()) {
        if (key.startsWith(`${userId}:`)) {
            permissionCache.delete(key);
            invalidatedCount++;
        }
    }
    logger_1.AppLogger.debug(`Invalidated ${invalidatedCount} cache entries for user ${userId}`);
}
/**
 * Clear all permission cache (useful for testing)
 */
function clearAllCache() {
    const size = permissionCache.size;
    permissionCache.clear();
    logger_1.AppLogger.info(`Cleared all permission cache (${size} entries)`);
}
/**
 * Get cache statistics
 */
function getCacheStats() {
    return {
        size: permissionCache.size,
        capacity: MAX_CACHE_SIZE,
        utilizationPercent: (permissionCache.size / MAX_CACHE_SIZE) * 100,
    };
}
/**
 * Check if user can perform an action based on permission
 */
function canPerformAction(permission, requiredAction) {
    const actionPermissionMap = {
        read: ['read', 'write', 'maintain', 'admin'],
        write: ['write', 'maintain', 'admin'],
        maintain: ['maintain', 'admin'],
        admin: ['admin'],
    };
    const allowedPermissions = actionPermissionMap[requiredAction] || [];
    return allowedPermissions.includes(permission);
}
