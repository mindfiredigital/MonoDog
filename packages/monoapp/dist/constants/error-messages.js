"use strict";
/**
 * Error Messages
 * Centralized error messages for consistent error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractErrorMessage = exports.FILE_OPERATION_ERRORS = exports.OPERATION_ERRORS = exports.VALIDATION_ERRORS = exports.PERMISSION_ERRORS = exports.AUTH_ERRORS = void 0;
// ============ AUTHENTICATION ERRORS ============
exports.AUTH_ERRORS = {
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
};
// ============ PERMISSION ERRORS ============
exports.PERMISSION_ERRORS = {
    INSUFFICIENT_PERMISSION: (requiredPermission) => `This action requires ${requiredPermission} permission`,
    INSUFFICIENT_WRITE_PERMISSION: (userPermission) => `This action requires write permission. You have: ${userPermission}`,
    INSUFFICIENT_MAINTAIN_PERMISSION: (userPermission) => `This action requires maintain permission. You have: ${userPermission}`,
    FORBIDDEN: 'Forbidden',
    ADMIN_RIGHTS_REQUIRED: 'User does not have admin rights to the repository',
    NO_WRITE_PERMISSION: 'You do not have write permission',
    NO_ADMIN_PERMISSION: 'You do not have admin permission',
    PERMISSION_NOT_RESOLVED: 'Permission not resolved for repository',
};
// ============ VALIDATION ERRORS ============
exports.VALIDATION_ERRORS = {
    PACKAGES_ARRAY_REQUIRED: 'packages array is required',
    INVALID_REQUEST: 'Invalid request',
    INVALID_SUMMARY: 'Invalid summary',
    SUMMARY_TOO_SHORT: 'Summary must be at least 10 characters',
    INVALID_JSON_FORMAT: (error) => error ? `Invalid JSON format: ${error}` : 'Invalid JSON format',
    INVALID_PACKAGE_JSON: (error) => error ? `Invalid package.json: ${error}` : 'Invalid package.json',
    WORKING_TREE_NOT_CLEAN: 'Please commit or stash all changes before publishing',
    NO_CHANGESETS: 'Create changesets before publishing',
    INVALID_CHANGELOG: 'Changelog format is invalid',
    CURRENT_STATUS_REQUIRED: 'currentStatus is required',
};
// ============ OPERATION ERRORS ============
exports.OPERATION_ERRORS = {
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
};
// ============ FILE OPERATION ERRORS ============
exports.FILE_OPERATION_ERRORS = {
    INVALID_FILE_PATH: 'Invalid file path',
    FILE_NOT_WRITABLE: (filePath) => `File is not writable or does not exist: ${filePath}`,
    PACKAGE_DIRECTORY_NOT_FOUND: (packagePath) => `Package directory not found: ${packagePath}`,
    PACKAGE_JSON_NOT_FOUND: (packagePath) => `package.json not found in directory: ${packagePath}`,
};
/**
 * Extract error message from error object
 */
const extractErrorMessage = (error, defaultMessage = 'Unknown error') => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return defaultMessage;
};
exports.extractErrorMessage = extractErrorMessage;
