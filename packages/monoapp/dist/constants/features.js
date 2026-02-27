"use strict";
/**
 * Application Feature Constants
 * Constants related to application features and configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATE_EXPIRY = exports.PERMISSION_HIERARCHY = exports.PermissionLevel = exports.GITHUB_OAUTH = exports.GITHUB_ACTIONS = void 0;
exports.canPerformAction = canPerformAction;
// ============ GITHUB ACTIONS ============
exports.GITHUB_ACTIONS = {
    WORKFLOWS_ENDPOINT: (owner, repo) => `/repos/${owner}/${repo}/actions/workflows`,
    WORKFLOW_RUNS_ENDPOINT: (owner, repo, workflowId) => `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`,
    WORKFLOW_RUN_ENDPOINT: (owner, repo, runId) => `/repos/${owner}/${repo}/actions/runs/${runId}`,
    JOBS_ENDPOINT: (owner, repo, runId) => `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`,
    LOGS_ENDPOINT: (owner, repo, jobId) => `/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`,
    RERUN_ENDPOINT: (owner, repo, runId) => `/repos/${owner}/${repo}/actions/runs/${runId}/rerun`,
    CANCEL_ENDPOINT: (owner, repo, runId) => `/repos/${owner}/${repo}/actions/runs/${runId}/cancel`,
    TRIGGER_WORKFLOW_ENDPOINT: (owner, repo, workflowId) => `/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
};
// ============ GITHUB OAUTH ============
exports.GITHUB_OAUTH = {
    OAUTH_TOKEN_ENDPOINT: '/login/oauth/access_token',
    USER_ENDPOINT: '/user',
    USER_EMAIL_ENDPOINT: '/user/emails',
    REPOSITORY_PERMISSION_ENDPOINT: (owner, repo, username) => `/repos/${owner}/${repo}/collaborators/${username}/permission`,
};
/**
 * Higher number = Higher authority
 */
exports.PermissionLevel = {
    'none': 0,
    'read': 1,
    'write': 2,
    'maintain': 3,
    'admin': 4,
};
/**
 * Check if user can perform an action based on permission
 */
function canPerformAction(userPermission, requiredAction) {
    return exports.PermissionLevel[userPermission] >= exports.PermissionLevel[requiredAction];
}
/**
 * Permission levels in hierarchy
 */
exports.PERMISSION_HIERARCHY = {
    ADMIN: { level: 4, name: 'admin' },
    MAINTAIN: { level: 3, name: 'maintain' },
    WRITE: { level: 2, name: 'write' },
    READ: { level: 1, name: 'read' },
    NONE: { level: 0, name: 'none' },
};
exports.STATE_EXPIRY = 10 * 60 * 1000; // 10 minutes
