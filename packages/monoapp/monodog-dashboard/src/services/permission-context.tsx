/**
 * Permission Context and Hooks
 * Manages repository permissions per user
 */

import React, {
  createContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

export type RepositoryPermission =
  | 'admin'
  | 'maintain'
  | 'write'
  | 'read'
  | 'none';

export type MonoDogPermissionRole =
  | 'Admin'
  | 'Maintainer'
  | 'Collaborator'
  | 'Denied';

export interface PermissionCheckResponse {
  permission: RepositoryPermission;
  role: MonoDogPermissionRole;
  canAdmin: boolean;
  canMaintain: boolean;
  canWrite: boolean;
  canRead: boolean;
  denied: boolean;
}

export interface PermissionContextType {
  permissions: Map<string, PermissionCheckResponse>;
  isLoading: boolean;
  error: string | null;
  checkPermission: (
    sessionToken: string,
    owner: string,
    repo: string
  ) => Promise<PermissionCheckResponse | null>;
  canPerformAction: (
    sessionToken: string,
    owner: string,
    repo: string,
    action: 'read' | 'write' | 'maintain' | 'admin'
  ) => Promise<boolean>;
  invalidatePermission: (owner: string, repo: string) => void;
  invalidateAll: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);
const apiUrl = (window as any).ENV?.API_URL ?? 'http://localhost:8999';
const API_BASE = `${apiUrl}/api`;

export interface PermissionProviderProps {
  children: ReactNode;
}

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

        const response = await fetch(`${API_BASE}/permissions/${owner}/${repo}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized');
          }
          throw new Error('Failed to check permission');
        }

        const data = await response.json();

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
        setPermissions((prev) => {
          const newMap = new Map(prev);
          newMap.set(cacheKey, permission);
          return newMap;
        });

        return permission;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Permission check failed';
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

        const response = await fetch(
          `${API_BASE}/permissions/${owner}/${repo}/can-action`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${sessionToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to check action permission');
        }

        const data = await response.json();
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
    setPermissions((prev) => {
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
    throw new Error(
      'usePermission must be used within a PermissionProvider'
    );
  }
  return context;
}

export default PermissionContext;
