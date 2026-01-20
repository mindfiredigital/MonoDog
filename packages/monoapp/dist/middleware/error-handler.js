"use strict";
/**
 * Error handling middleware for Express
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("./logger");
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
        error: 'Internal server error',
        timestamp: Date.now(),
    });
};
exports.errorHandler = errorHandler;
/**
 * 404 Not Found handler
 */
const notFoundHandler = (_req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        timestamp: Date.now(),
    });
};
exports.notFoundHandler = notFoundHandler;
