/**
 * API Response Messages
 * Centralized messages for API responses
 */

// ============ SUCCESS MESSAGES ============

/**
 * Authentication messages
 */
export const AUTH_MESSAGES = {
  LOGIN_INITIATED: 'Redirect to this URL to authenticate with GitHub',
  AUTHENTICATION_SUCCESSFUL: 'Authentication successful',
  LOGOUT_SUCCESSFUL: 'Logged out successfully',
  SESSION_VALID: 'Session is valid',
  SESSION_REFRESHED: 'Session refreshed successfully',
} as const;

/**
 * Changeset messages
 */
export const CHANGESET_MESSAGES = {
  CREATED: 'Changeset created successfully',
  FETCHED: 'Changesets fetched successfully',
  NOT_FOUND: 'No changesets found',
} as const;

/**
 * Publish messages
 */
export const PUBLISH_MESSAGES = {
  WORKFLOW_INITIATED: 'Publishing workflow initiated',
  PACKAGES_FETCHED: 'Packages fetched successfully',
  PUBLISH_INITIATED: 'Publish process initiated',
  PREVIEW_SUCCESSFUL: 'Publish preview generated successfully',
} as const;

/**
 * Pipeline messages
 */
export const PIPELINE_MESSAGES = {
  TRIGGERED_SUCCESSFULLY: 'Workflow triggered successfully',
  WORKFLOW_FETCHED: 'Workflow fetched successfully',
  WORKFLOWS_FETCHED: 'Workflows fetched successfully',
  LOGS_FETCHED: 'Job logs fetched successfully',
  RUNS_FETCHED: 'Workflow runs fetched successfully',
} as const;
