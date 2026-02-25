/**
 * Permission Service
 * Manages repository permission caching and validation
 */

import type {
  CachedPermission,
  RepositoryPermission,
  MonoDogPermissionRole,
} from '../types/auth';
import {
  getRepositoryPermission,
  mapPermissionToRole,
} from './github-oauth-service';
import { AppLogger } from '../middleware/logger';

// Cache storage: key = `${userId}:${owner}/${repo}`
const permissionCache = new Map<string, CachedPermission>();

// Configuration
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 10000;
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

/**
 * Start periodic cleanup of expired cache entries
 */
export function startCacheCleanup(): void {
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
      AppLogger.debug(`Cleaned ${cleanedCount} expired permission cache entries`);
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Generate cache key
 */
function getCacheKey(
  userId: number,
  owner: string,
  repo: string
): string {
  return `${userId}:${owner}/${repo}`;
}

/**
 * Get cached permission if still valid
 */
function getCachedPermission(
  userId: number,
  owner: string,
  repo: string
): CachedPermission | null {
  const key = getCacheKey(userId, owner, repo);
  const cached = permissionCache.get(key);

  if (!cached) {
    return null;
  }

  const now = Date.now();
  if (now > cached.cachedAt + cached.ttl) {
    // Cache expired
    permissionCache.delete(key);
    AppLogger.debug(`Cache expired for ${key}`);
    return null;
  }

  return cached;
}

/**
 * Set permission in cache
 */
function setCachedPermission(
  userId: number,
  username: string,
  owner: string,
  repo: string,
  permission: RepositoryPermission,
  ttl: number = DEFAULT_TTL
): CachedPermission {
  const role = mapPermissionToRole(permission);

  const cached: CachedPermission = {
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
      AppLogger.debug(`Evicted oldest cache entry: ${oldestKey}`);
    }
  }

  permissionCache.set(key, cached);
  AppLogger.debug(`Cached permission for ${key}: ${permission}`);
  return cached;
}

/**
 * Get user's permission for a repository
 * Checks cache first, then queries GitHub API if needed
 */
export async function getUserRepositoryPermission(
  accessToken: string,
  userId: number,
  username: string,
  owner: string,
  repo: string,
  forceRefresh: boolean = false
): Promise<CachedPermission> {
  // Check cache if not forcing refresh
  if (!forceRefresh) {
    const cached = getCachedPermission(userId, owner, repo);
    if (cached) {
      return cached;
    }
  }

  // Query GitHub API
  AppLogger.debug(
    `Querying GitHub API for ${username}'s permission in ${owner}/${repo}`
  );

  try {
    const response = await getRepositoryPermission(
      accessToken,
      owner,
      repo,
      username
    );

    return setCachedPermission(
      userId,
      username,
      owner,
      repo,
      response.permission
    );
  } catch (error) {
    AppLogger.error(`Failed to get repository permission: ${error}`);
    // Return 'none' permission on error
    return setCachedPermission(userId, username, owner, repo, 'none');
  }
}

/**
 * Invalidate permission cache for a user-repository pair
 */
export function invalidatePermissionCache(
  userId: number,
  owner: string,
  repo: string
): void {
  const key = getCacheKey(userId, owner, repo);
  permissionCache.delete(key);
  AppLogger.debug(`Invalidated cache for ${key}`);
}

/**
 * Invalidate all permissions for a user
 */
export function invalidateUserCache(userId: number): void {
  let invalidatedCount = 0;

  for (const key of permissionCache.keys()) {
    if (key.startsWith(`${userId}:`)) {
      permissionCache.delete(key);
      invalidatedCount++;
    }
  }

  AppLogger.debug(`Invalidated ${invalidatedCount} cache entries for user ${userId}`);
}

/**
 * Clear all permission cache (useful for testing)
 */
export function clearAllCache(): void {
  const size = permissionCache.size;
  permissionCache.clear();
  AppLogger.info(`Cleared all permission cache (${size} entries)`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  capacity: number;
  utilizationPercent: number;
} {
  return {
    size: permissionCache.size,
    capacity: MAX_CACHE_SIZE,
    utilizationPercent: (permissionCache.size / MAX_CACHE_SIZE) * 100,
  };
}

/**
 * Check if user can perform an action based on permission
 */
export function canPerformAction(
  permission: RepositoryPermission,
  requiredAction: 'read' | 'write' | 'maintain' | 'admin'
): boolean {
  const actionPermissionMap: Record<string, RepositoryPermission[]> = {
    read: ['read', 'write', 'maintain', 'admin'],
    write: ['write', 'maintain', 'admin'],
    maintain: ['maintain', 'admin'],
    admin: ['admin'],
  };

  const allowedPermissions = actionPermissionMap[requiredAction] || [];
  return allowedPermissions.includes(permission);
}
