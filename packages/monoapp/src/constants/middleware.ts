/**
 * Middleware Constants
 * Defines constants used across middleware modules
 */

/**
 * HTTP status code for internal server error
 */
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

/**
 * HTTP status code for not found
 */
export const HTTP_STATUS_NOT_FOUND = 404;

/**
 * HTTP status code for bad request
 */
export const HTTP_STATUS_BAD_REQUEST = 400;

/**
 * Error message for port already in use
 */
export const ERROR_PORT_IN_USE = (port: number): string =>
  `Port ${port} is already in use. Please specify a different port.`;

/**
 * Error message for permission denied
 */
export const ERROR_PERMISSION_DENIED = (port: number): string =>
  `Permission denied to listen on port ${port}. Use a port above 1024.`;

/**
 * Error message for internal server error
 */
export const ERROR_INTERNAL_SERVER = 'Internal server error';

/**
 * Success message for server start
 */
export const SUCCESS_SERVER_START = (host: string, port: number): string =>
  `Backend server listening on http://${host}:${port}`;

/**
 * Success message for dashboard start
 */
export const SUCCESS_DASHBOARD_START = (host: string, port: number): string =>
  `Dashboard listening on http://${host}:${port}`;

/**
 * Message for graceful shutdown
 */
export const MESSAGE_GRACEFUL_SHUTDOWN = 'SIGTERM signal received: closing HTTP server';

/**
 * Message for server closed
 */
export const MESSAGE_SERVER_CLOSED = 'HTTP server closed';

/**
 * Message for dashboard graceful shutdown
 */
export const MESSAGE_DASHBOARD_GRACEFUL_SHUTDOWN = 'SIGTERM signal received: closing dashboard server';

/**
 * Message for dashboard closed
 */
export const MESSAGE_DASHBOARD_CLOSED = 'Dashboard server closed';

/**
 * Content-Type header for JavaScript
 */
export const CONTENT_TYPE_JAVASCRIPT = 'application/javascript';

/**
 * Error serving index.html message
 */
export const ERROR_SERVING_INDEX_HTML = 'Error serving index.html:';

/**
 * Shutdown instruction message
 */
export const MESSAGE_SHUTDOWN_INSTRUCTION = 'Press Ctrl+C to quit.';
