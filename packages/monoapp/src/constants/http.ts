/**
 * HTTP Constants
 * HTTP status codes and related constants
 */

// ============ HTTP STATUS CODES ============

/**
 * 2xx Success Status Codes
 */
export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_CREATED = 201;
export const HTTP_STATUS_ACCEPTED = 202;
export const HTTP_STATUS_NO_CONTENT = 204;

/**
 * 3xx Redirect Status Codes
 */
export const HTTP_STATUS_MOVED_PERMANENTLY = 301;
export const HTTP_STATUS_FOUND = 302;
export const HTTP_STATUS_NOT_MODIFIED = 304;
export const HTTP_STATUS_TEMPORARY_REDIRECT = 307;
export const HTTP_STATUS_PERMANENT_REDIRECT = 308;

/**
 * 4xx Client Error Status Codes
 */
export const HTTP_STATUS_BAD_REQUEST = 400;
export const HTTP_STATUS_UNAUTHORIZED = 401;
export const HTTP_STATUS_FORBIDDEN = 403;
export const HTTP_STATUS_NOT_FOUND = 404;
export const HTTP_STATUS_METHOD_NOT_ALLOWED = 405;
export const HTTP_STATUS_CONFLICT = 409;
export const HTTP_STATUS_UNPROCESSABLE_ENTITY = 422;
export const HTTP_STATUS_TOO_MANY_REQUESTS = 429;

/**
 * 5xx Server Error Status Codes
 */
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
export const HTTP_STATUS_NOT_IMPLEMENTED = 501;
export const HTTP_STATUS_BAD_GATEWAY = 502;
export const HTTP_STATUS_SERVICE_UNAVAILABLE = 503;
export const HTTP_STATUS_GATEWAY_TIMEOUT = 504;

export const ENDPOINTS = [
  // Auth endpoints
  'GET  /api/auth/login',
  'GET  /api/auth/callback',
  'GET  /api/auth/me',
  'POST /api/auth/validate',
  'POST /api/auth/logout',
  'POST /api/auth/refresh',
  // Permission endpoints
  'GET  /api/permissions/:owner/:repo',
  'POST /api/permissions/:owner/:repo/can-action',
  'POST /api/permissions/:owner/:repo/invalidate',
  // Package endpoints
  'POST /api/packages/refresh',
  'GET  /api/packages',
  'GET  /api/packages/:name',
  'PUT  /api/packages/update-config',
  // Commit endpoints
  'GET  /api/commits/:packagePath',
  // Health endpoints
  'GET  /api/health/packages',
  'POST /api/health/refresh',
  // Config endpoints
  'PUT  /api/config/files/:id',
  'GET  /api/config/files',
  // Publish endpoints
  'GET  /api/publish/packages',
  'GET  /api/publish/changesets',
  'GET  /api/publish/status',
  'POST /api/publish/preview',
  'POST /api/publish/changesets',
  'POST /api/publish/trigger',
  // Pipeline endpoints
  'GET  /api/pipelines',
  'PUT  /api/pipelines/:pipelineId/status',
  'GET  /api/pipelines/:pipelineId/audit-logs',
  // Workflow endpoints
  'GET  /api/workflows/:owner/:repo',
  'GET  /api/workflows/:owner/:repo/available',
  'GET  /api/workflows/:owner/:repo/runs/:runId',
  'GET  /api/workflows/:owner/:repo/jobs/:jobId/logs',
  'POST /api/workflows/:owner/:repo/trigger',
  'POST /api/workflows/:owner/:repo/runs/:runId/cancel',
  'POST /api/workflows/:owner/:repo/runs/:runId/rerun',
];
