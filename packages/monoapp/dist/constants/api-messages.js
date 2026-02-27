"use strict";
/**
 * API Response Messages
 * Centralized messages for API responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIPELINE_MESSAGES = exports.PUBLISH_MESSAGES = exports.CHANGESET_MESSAGES = exports.AUTH_MESSAGES = void 0;
// ============ SUCCESS MESSAGES ============
/**
 * Authentication messages
 */
exports.AUTH_MESSAGES = {
    LOGIN_INITIATED: 'Redirect to this URL to authenticate with GitHub',
    AUTHENTICATION_SUCCESSFUL: 'Authentication successful',
    LOGOUT_SUCCESSFUL: 'Logged out successfully',
    SESSION_VALID: 'Session is valid',
    SESSION_REFRESHED: 'Session refreshed successfully',
};
/**
 * Changeset messages
 */
exports.CHANGESET_MESSAGES = {
    CREATED: 'Changeset created successfully',
    FETCHED: 'Changesets fetched successfully',
    NOT_FOUND: 'No changesets found',
};
/**
 * Publish messages
 */
exports.PUBLISH_MESSAGES = {
    WORKFLOW_INITIATED: 'Publishing workflow initiated',
    PACKAGES_FETCHED: 'Packages fetched successfully',
    PUBLISH_INITIATED: 'Publish process initiated',
    PREVIEW_SUCCESSFUL: 'Publish preview generated successfully',
};
/**
 * Pipeline messages
 */
exports.PIPELINE_MESSAGES = {
    TRIGGERED_SUCCESSFULLY: 'Workflow triggered successfully',
    WORKFLOW_FETCHED: 'Workflow fetched successfully',
    WORKFLOWS_FETCHED: 'Workflows fetched successfully',
    LOGS_FETCHED: 'Job logs fetched successfully',
    RUNS_FETCHED: 'Workflow runs fetched successfully',
};
