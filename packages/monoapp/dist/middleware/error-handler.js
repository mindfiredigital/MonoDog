"use strict";
/**
 * Error handling middleware for Express
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("./logger");
const error_messages_1 = require("../constants/error-messages");
const http_1 = require("../constants/http");
/**
 * Global error handler middleware
 * Must be registered last in the middleware chain
 */
const errorHandler = (err, req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    logger_1.AppLogger.error('Request error occurred', {
        status,
        method: req.method,
        path: req.path,
        message: err.message,
        timestamp: new Date().toISOString(),
    });
    res.status(status).json({
        error: error_messages_1.OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
        timestamp: Date.now(),
    });
};
exports.errorHandler = errorHandler;
/**
 * 404 Not Found handler
 */
const notFoundHandler = (_req, res) => {
    res.status(http_1.HTTP_STATUS_NOT_FOUND).json({
        error: 'Endpoint not found',
        timestamp: Date.now(),
    });
};
exports.notFoundHandler = notFoundHandler;
