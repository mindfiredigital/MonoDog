"use strict";
/**
 * Server startup logic for the API backend
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const logger_1 = require("./logger");
const config_loader_1 = require("../config-loader");
const error_handler_1 = require("./error-handler");
const security_1 = require("./security");
const package_routes_1 = __importDefault(require("../routes/package-routes"));
const commit_routes_1 = __importDefault(require("../routes/commit-routes"));
const health_routes_1 = __importDefault(require("../routes/health-routes"));
const config_routes_1 = __importDefault(require("../routes/config-routes"));
// Security constants
const PORT_MIN = 1024;
const PORT_MAX = 65535;
/**
 * Validate port number
 */
function validatePort(port) {
    const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
    if (isNaN(portNum) || portNum < PORT_MIN || portNum > PORT_MAX) {
        throw new Error(`Port must be between ${PORT_MIN} and ${PORT_MAX}`);
    }
    return portNum;
}
/**
 * Create Express app with middleware configuration
 */
function createApp(rootPath) {
    const app = (0, express_1.default)();
    // Timeout middleware
    app.use((0, security_1.createTimeoutMiddleware)());
    // Store root path for routes
    app.locals.rootPath = rootPath;
    // Security and CORS setup
    const dashboardUrl = (0, security_1.buildDashboardUrl)(config_loader_1.appConfig);
    const apiUrl = (0, security_1.buildApiUrl)(config_loader_1.appConfig.server.host, config_loader_1.appConfig.server.port);
    app.use((0, security_1.createHelmetMiddleware)(apiUrl));
    app.use((0, security_1.createApiCorsMiddleware)(dashboardUrl));
    // Body parser
    app.use((0, body_parser_1.json)({ limit: '1mb' }));
    // HTTP request logging with Morgan
    app.use(logger_1.httpLogger);
    // Request logging
    // app.use(requestLogger);
    // Routes
    app.use('/api/packages', package_routes_1.default);
    app.use('/api/commits/', commit_routes_1.default);
    app.use('/api/health/', health_routes_1.default);
    app.use('/api/config/', config_routes_1.default);
    // 404 handler
    app.use('*', error_handler_1.notFoundHandler);
    // Global error handler (must be last)
    app.use(error_handler_1.errorHandler);
    return app;
}
/**
 * Start the API server
 */
function startServer(rootPath) {
    try {
        const port = config_loader_1.appConfig.server.port;
        const host = config_loader_1.appConfig.server.host;
        const validatedPort = validatePort(port);
        const app = createApp(rootPath);
        const server = app.listen(validatedPort, host, () => {
            logger_1.AppLogger.info(`Backend server running on http://${host}:${validatedPort}`);
            logger_1.AppLogger.info('API endpoints available:', {
                endpoints: [
                    'GET  /api/health',
                    'GET  /api/packages/refresh',
                    'GET  /api/packages',
                    'GET  /api/packages/:name',
                    'PUT  /api/packages/update-config',
                    'GET  /api/commits/:packagePath',
                    'GET  /api/health/packages',
                    'PUT  /api/config/files/:id',
                    'GET  /api/config/files',
                ],
            });
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger_1.AppLogger.error(`Port ${validatedPort} is already in use. Please specify a different port.`, err);
                process.exit(1);
            }
            else if (err.code === 'EACCES') {
                logger_1.AppLogger.error(`Permission denied to listen on port ${validatedPort}. Use a port above 1024.`, err);
                process.exit(1);
            }
            else {
                logger_1.AppLogger.error('Server failed to start:', err);
                process.exit(1);
            }
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger_1.AppLogger.info('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                logger_1.AppLogger.info('HTTP server closed');
                process.exit(0);
            });
        });
    }
    catch (error) {
        const err = error;
        logger_1.AppLogger.error('Failed to start server:', err);
        process.exit(1);
    }
}
