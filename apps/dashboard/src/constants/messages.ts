/**
 * Dashboard Messages
 * Frontend messages for API operations and user feedback
 */

// ============ AUTH MESSAGES ============

export const DASHBOARD_AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful! Redirecting...',
  LOGIN_FAILED: 'Login failed',
  LOGOUT_SUCCESS: 'You have been logged out',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  AUTH_FAILED: 'Authentication failed',
} as const;

// ============ ERROR MESSAGES ============

export const DASHBOARD_ERROR_MESSAGES = {
  UNKNOWN_ERROR: 'Unknown error occurred',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  FAILED_TO_FETCH_PACKAGES: 'Failed to fetch workspace packages',
  FAILED_TO_FETCH_WORKFLOWS: 'Failed to fetch workflows',
  FAILED_TO_TRIGGER_WORKFLOW: 'Failed to trigger workflow',
  FAILED_TO_CANCEL_RUN: 'Failed to cancel workflow run',
  FAILED_TO_RERUN_WORKFLOW: 'Failed to rerun workflow',
  FAILED_TO_FETCH_LOGS: 'Failed to fetch job logs',
  PERMISSION_ERROR: 'Permission denied',
  AUTHENTICATION_ERROR: 'Authentication error',
  FAILED_TO_FETCH_USER_INFO: 'Failed to fetch user info',
  FAILED_TO_REFRESH_SESSION: 'Failed to refresh session',
  FAILED_TO_CHECK_PERMISSION: 'Failed to check permission',
  FAILED_TO_CHECK_ACTION_PERMISSION: 'Failed to check action permission',
  VALIDATION_FAILED: 'Validation failed',
  FAILED_TO_CREATE_CHANGESET: 'Failed to create changeset',
  FAILED_TO_TRIGGER_PUBLISH: 'Failed to trigger publish',
  FAILED_TO_SAVE_CONFIG: 'Failed to save configuration',
} as const;

export const CHANGESET_SUMMARY =
  "Describe the changes in this release (e.g., 'Add new API endpoints for user management')";
export const SUMMARY_LIMIT = 'Summary must be at least 10 characters';
