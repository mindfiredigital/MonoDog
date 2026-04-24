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
  PROCESSING_CALLBACK: 'Processing OAuth callback',
  LOGIN_INITIATED: 'Login initiated',
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
  OAUTH_AUTHENTICATION_FAILED: 'OAuth authentication failed',
  INVALID_STATE_PARAMETER: 'Invalid state parameter',
  MISSING_CODE: 'Missing authorization code',
} as const;

export const statusTone: Record<string, string> = {
  queued: 'bg-amber-100 text-amber-800 border-amber-200',
  in_progress: 'bg-sky-100 text-sky-800 border-sky-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  failure: 'bg-rose-100 text-rose-800 border-rose-200',
  cancelled: 'bg-slate-200 text-slate-700 border-slate-300',
};

export const ansiColorMap: Record<number, string> = {
  30: '#111827',
  31: '#dc2626',
  32: '#16a34a',
  33: '#ca8a04',
  34: '#2563eb',
  35: '#9333ea',
  36: '#0891b2',
  37: '#e5e7eb',
  90: '#6b7280',
  91: '#f87171',
  92: '#4ade80',
  93: '#fde047',
  94: '#60a5fa',
  95: '#c084fc',
  96: '#22d3ee',
  97: '#f9fafb',
};
export const CHANGESET_SUMMARY =
  "Describe the changes in this release (e.g., 'Add new API endpoints for user management')";
export const SUMMARY_LIMIT = 'Summary must be at least 10 characters';
