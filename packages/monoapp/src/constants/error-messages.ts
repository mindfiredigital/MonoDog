/**
 * Error Messages
 * Centralized error messages for consistent error handling
 */

// ============ AUTHENTICATION ERRORS ============

export const AUTH_ERRORS = {
  TOKEN_REQUIRED: 'Authentication token required',
  INVALID_OR_EXPIRED_SESSION: 'Invalid or expired session',
  SESSION_NOT_FOUND: 'Session not found',
  PERMISSION_NOT_RESOLVED: 'Permission not resolved for repository',
  MISSING_CODE_OR_STATE: 'OAuth code and state are required',
  MISSING_PARAMETERS: 'Missing parameters',
  GITHUB_OAUTH_FAILED: 'Failed to complete GitHub OAuth flow',
  LOGIN_FAILED: 'Login failed',
  LOGIN_INITIATION_FAILED: 'Failed to initiate GitHub OAuth flow',
  UNAUTHORIZED: 'Unauthorized',
  INVALID_STATE: 'Invalid state',
} as const;

// ============ PERMISSION ERRORS ============

export const PERMISSION_ERRORS = {
  INSUFFICIENT_PERMISSION: (requiredPermission: string) =>
    `This action requires ${requiredPermission} permission`,
  INSUFFICIENT_WRITE_PERMISSION: (userPermission: string) =>
    `This action requires write permission. You have: ${userPermission}`,
  INSUFFICIENT_MAINTAIN_PERMISSION: (userPermission: string) =>
    `This action requires maintain permission. You have: ${userPermission}`,
  FORBIDDEN: 'Forbidden',
  ADMIN_RIGHTS_REQUIRED: 'User does not have admin rights to the repository',
  NO_WRITE_PERMISSION: 'You do not have write permission',
  NO_ADMIN_PERMISSION: 'You do not have admin permission',
  PERMISSION_NOT_RESOLVED: 'Permission not resolved for repository',
} as const;

// ============ VALIDATION ERRORS ============

export const VALIDATION_ERRORS = {
  PACKAGES_ARRAY_REQUIRED: 'packages array is required',
  INVALID_REQUEST: 'Invalid request',
  INVALID_SUMMARY: 'Invalid summary',
  SUMMARY_TOO_SHORT: 'Summary must be at least 10 characters',
  INVALID_JSON_FORMAT: (error?: string) =>
    error ? `Invalid JSON format: ${error}` : 'Invalid JSON format',
  INVALID_PACKAGE_JSON: (error?: string) =>
    error ? `Invalid package.json: ${error}` : 'Invalid package.json',
  WORKING_TREE_NOT_CLEAN: 'Please commit or stash all changes before publishing',
  NO_CHANGESETS: 'Create changesets before publishing',
  INVALID_CHANGELOG: 'Changelog format is invalid',
  CURRENT_STATUS_REQUIRED: 'currentStatus is required',
} as const;

// ============ OPERATION ERRORS ============

export const OPERATION_ERRORS = {
  FAILED_TO_FETCH_PACKAGES: 'Failed to fetch packages',
  FAILED_TO_FETCH_COMMITS: 'Failed to fetch commits',
  FAILED_TO_FETCH_CHANGESETS: 'Failed to fetch changesets',
  FAILED_TO_CREATE_CHANGESET: 'Failed to create changeset',
  FAILED_TO_PREVIEW_PUBLISH: 'Failed to preview publish',
  FAILED_TO_PUBLISH: 'Failed to publish packages',
  FAILED_TO_TRIGGER_WORKFLOW: 'Failed to trigger workflow',
  FAILED_TO_FETCH_WORKFLOW_RUNS: 'Failed to fetch workflow runs',
  FAILED_TO_FETCH_LOGS: 'Failed to fetch job logs',
  FAILED_TO_RERUN_WORKFLOW: 'Failed to rerun workflow',
  FAILED_TO_CANCEL_WORKFLOW: 'Failed to cancel workflow',
  FAILED_TO_PARSE_CONFIG: 'Failed to parse configuration file',
  FAILED_TO_SAVE_CONFIG: 'Failed to save configuration',
} as const;

// ============ FILE OPERATION ERRORS ============

export const FILE_OPERATION_ERRORS = {
  INVALID_FILE_PATH: 'Invalid file path',
  FILE_NOT_WRITABLE: (filePath: string) => `File is not writable or does not exist: ${filePath}`,
  PACKAGE_DIRECTORY_NOT_FOUND: (packagePath: string) => `Package directory not found: ${packagePath}`,
  PACKAGE_JSON_NOT_FOUND: (packagePath: string) => `package.json not found in directory: ${packagePath}`,
} as const;

/**
 * Extract error message from error object
 */
export const extractErrorMessage = (error: Error | string | unknown, defaultMessage: string = 'Unknown error'): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  return defaultMessage;
};
