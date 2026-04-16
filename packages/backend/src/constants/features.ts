/**
 * Application Feature Constants
 * Constants related to application features and configuration
 */

import type { RepositoryPermission } from '../types/auth';

// ============ GITHUB ACTIONS ============

export const GITHUB_ACTIONS = {
  WORKFLOWS_ENDPOINT: (owner: string, repo: string) =>
    `/repos/${owner}/${repo}/actions/workflows`,
  WORKFLOW_RUNS_ENDPOINT: (owner: string, repo: string, workflowId: string) =>
    `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`,
  WORKFLOW_RUN_ENDPOINT: (owner: string, repo: string, runId: number) =>
    `/repos/${owner}/${repo}/actions/runs/${runId}`,
  JOBS_ENDPOINT: (owner: string, repo: string, runId: number) =>
    `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`,
  LOGS_ENDPOINT: (owner: string, repo: string, jobId: number) =>
    `/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`,
  RERUN_ENDPOINT: (owner: string, repo: string, runId: number) =>
    `/repos/${owner}/${repo}/actions/runs/${runId}/rerun`,
  CANCEL_ENDPOINT: (owner: string, repo: string, runId: number) =>
    `/repos/${owner}/${repo}/actions/runs/${runId}/cancel`,
  TRIGGER_WORKFLOW_ENDPOINT: (
    owner: string,
    repo: string,
    workflowId: string
  ) => `/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
} as const;

// ============ GITHUB OAUTH ============

export const GITHUB_OAUTH = {
  OAUTH_TOKEN_ENDPOINT: '/login/oauth/access_token',
  USER_ENDPOINT: '/user',
  USER_EMAIL_ENDPOINT: '/user/emails',
  REPOSITORY_PERMISSION_ENDPOINT: (
    owner: string,
    repo: string,
    username: string
  ) => `/repos/${owner}/${repo}/collaborators/${username}/permission`,
} as const;

/**
 * Higher number = Higher authority
 */
export const PermissionLevel: Record<RepositoryPermission, number> = {
  none: 0,
  read: 1,
  write: 2,
  maintain: 3,
  admin: 4,
};

/**
 * Check if user can perform an action based on permission
 */
export function canPerformAction(
  userPermission: RepositoryPermission,
  requiredAction: Exclude<RepositoryPermission, 'none'>
): boolean {
  return PermissionLevel[userPermission] >= PermissionLevel[requiredAction];
}

/**
 * Permission levels in hierarchy
 */
export const PERMISSION_HIERARCHY = {
  ADMIN: { level: 4, name: 'admin' },
  MAINTAIN: { level: 3, name: 'maintain' },
  WRITE: { level: 2, name: 'write' },
  READ: { level: 1, name: 'read' },
  NONE: { level: 0, name: 'none' },
} as const;

export const STATE_EXPIRY = 10 * 60 * 1000; // 10 minutes
