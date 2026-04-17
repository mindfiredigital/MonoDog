/**
 * Permission Service DTOs and Response Types
 */

import type { RepositoryPermission, MonoDogPermissionRole } from './auth';

export interface PermissionCheckDTO {
  permission: RepositoryPermission;
  role: MonoDogPermissionRole;
  canAdmin: boolean;
  canMaintain: boolean;
  canWrite: boolean;
  canRead: boolean;
  denied: boolean;
}

/**
 * Action Check Response DTO
 */
export interface ActionCheckDTO {
  action: string;
  can: boolean;
  permission: RepositoryPermission;
  role: MonoDogPermissionRole;
}
