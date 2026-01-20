"use strict";
/**
 * Middleware Constants
 * Defines constants used across middleware modules
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGE_SHUTDOWN_INSTRUCTION = exports.ERROR_SERVING_INDEX_HTML = exports.CONTENT_TYPE_JAVASCRIPT = exports.MESSAGE_DASHBOARD_CLOSED = exports.MESSAGE_DASHBOARD_GRACEFUL_SHUTDOWN = exports.MESSAGE_SERVER_CLOSED = exports.MESSAGE_GRACEFUL_SHUTDOWN = exports.SUCCESS_DASHBOARD_START = exports.SUCCESS_SERVER_START = exports.ERROR_INTERNAL_SERVER = exports.ERROR_PERMISSION_DENIED = exports.ERROR_PORT_IN_USE = exports.HTTP_STATUS_BAD_REQUEST = exports.HTTP_STATUS_NOT_FOUND = exports.HTTP_STATUS_INTERNAL_SERVER_ERROR = void 0;
/**
 * HTTP status code for internal server error
 */
exports.HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
/**
 * HTTP status code for not found
 */
exports.HTTP_STATUS_NOT_FOUND = 404;
/**
 * HTTP status code for bad request
 */
exports.HTTP_STATUS_BAD_REQUEST = 400;
/**
 * Error message for port already in use
 */
const ERROR_PORT_IN_USE = (port) => `Port ${port} is already in use. Please specify a different port.`;
exports.ERROR_PORT_IN_USE = ERROR_PORT_IN_USE;
/**
 * Error message for permission denied
 */
const ERROR_PERMISSION_DENIED = (port) => `Permission denied to listen on port ${port}. Use a port above 1024.`;
exports.ERROR_PERMISSION_DENIED = ERROR_PERMISSION_DENIED;
/**
 * Error message for internal server error
 */
exports.ERROR_INTERNAL_SERVER = 'Internal server error';
/**
 * Success message for server start
 */
const SUCCESS_SERVER_START = (host, port) => `Backend server listening on http://${host}:${port}`;
exports.SUCCESS_SERVER_START = SUCCESS_SERVER_START;
/**
 * Success message for dashboard start
 */
const SUCCESS_DASHBOARD_START = (host, port) => `Dashboard listening on http://${host}:${port}`;
exports.SUCCESS_DASHBOARD_START = SUCCESS_DASHBOARD_START;
/**
 * Message for graceful shutdown
 */
exports.MESSAGE_GRACEFUL_SHUTDOWN = 'SIGTERM signal received: closing HTTP server';
/**
 * Message for server closed
 */
exports.MESSAGE_SERVER_CLOSED = 'HTTP server closed';
/**
 * Message for dashboard graceful shutdown
 */
exports.MESSAGE_DASHBOARD_GRACEFUL_SHUTDOWN = 'SIGTERM signal received: closing dashboard server';
/**
 * Message for dashboard closed
 */
exports.MESSAGE_DASHBOARD_CLOSED = 'Dashboard server closed';
/**
 * Content-Type header for JavaScript
 */
exports.CONTENT_TYPE_JAVASCRIPT = 'application/javascript';
/**
 * Error serving index.html message
 */
exports.ERROR_SERVING_INDEX_HTML = 'Error serving index.html:';
/**
 * Shutdown instruction message
 */
exports.MESSAGE_SHUTDOWN_INSTRUCTION = 'Press Ctrl+C to quit.';
