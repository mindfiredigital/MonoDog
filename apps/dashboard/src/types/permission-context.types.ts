/**
 * Permission Context Types
 */

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

export interface PermissionProviderProps {
  children: React.ReactNode;
}
