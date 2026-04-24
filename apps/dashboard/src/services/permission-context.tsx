/**
 * Permission Context and Hooks
 * Manages repository permissions per user
 */

import React, { createContext, useState, useCallback } from 'react';
import { DASHBOARD_ERROR_MESSAGES } from '../constants/messages';
import apiClient from './api';
import type {
  PermissionCheckResponse,
  PermissionContextType,
  PermissionProviderProps,
} from '../types/permission-context.types';

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

export function PermissionProvider({ children }: PermissionProviderProps) {
  const [permissions, setPermissions] = useState<
    Map<string, PermissionCheckResponse>
  >(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get cache key for permission
   */
  const getCacheKey = (owner: string, repo: string): string => {
    return `${owner}/${repo}`;
  };

  /**
   * Check user's permission for a repository
   */
  const checkPermission = useCallback(
    async (
      sessionToken: string,
      owner: string,
      repo: string
    ): Promise<PermissionCheckResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const cacheKey = getCacheKey(owner, repo);

        // Check cache first
        if (permissions.has(cacheKey)) {
          return permissions.get(cacheKey) || null;
        }

        const response = await apiClient.get(`/permissions/${owner}/${repo}`);

        if (!response.success) {
          if (response.error.status === 401) {
            throw new Error(DASHBOARD_ERROR_MESSAGES.AUTHENTICATION_ERROR);
          }
          throw new Error(DASHBOARD_ERROR_MESSAGES.FAILED_TO_CHECK_PERMISSION);
        }

        const data = response.data as any;

        const permission: PermissionCheckResponse = {
          permission: data.permission,
          role: data.role,
          canAdmin: data.canAdmin,
          canMaintain: data.canMaintain,
          canWrite: data.canWrite,
          canRead: data.canRead,
          denied: data.denied,
        };

        // Cache permission
        setPermissions(prev => {
          const newMap = new Map(prev);
          newMap.set(cacheKey, permission);
          return newMap;
        });

        return permission;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Permission check failed';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [permissions]
  );

  /**
   * Check if user can perform an action
   */
  const canPerformAction = useCallback(
    async (
      sessionToken: string,
      owner: string,
      repo: string,
      action: 'read' | 'write' | 'maintain' | 'admin'
    ): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.post(
          `/permissions/${owner}/${repo}/can-action`,
          { action }
        );

        if (!response.success) {
          throw new Error(
            DASHBOARD_ERROR_MESSAGES.FAILED_TO_CHECK_ACTION_PERMISSION
          );
        }

        const data = response.data as any;
        return data.can === true;
      } catch (err) {
        console.error('Action permission check error:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Invalidate permission cache for a repository
   */
  const invalidatePermission = useCallback((owner: string, repo: string) => {
    const cacheKey = getCacheKey(owner, repo);
    setPermissions(prev => {
      const newMap = new Map(prev);
      newMap.delete(cacheKey);
      return newMap;
    });
  }, []);

  /**
   * Clear all permission cache
   */
  const invalidateAll = useCallback(() => {
    setPermissions(new Map());
  }, []);

  const value: PermissionContextType = {
    permissions,
    isLoading,
    error,
    checkPermission,
    canPerformAction,
    invalidatePermission,
    invalidateAll,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook to use permission context
 */
export function usePermission(): PermissionContextType {
  const context = React.useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
}

// Re-export types for backward compatibility
export type {
  RepositoryPermission,
  MonoDogPermissionRole,
  PermissionCheckResponse,
  PermissionContextType,
  PermissionProviderProps,
} from '../types/permission-context.types';

export default PermissionContext;
