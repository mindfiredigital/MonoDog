"use strict";
/**
 * Dashboard server startup logic
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveDashboard = serveDashboard;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("./logger");
const config_loader_1 = require("../config-loader");
const error_handler_1 = require("./error-handler");
const security_1 = require("./security");
const constants_1 = require("../constants");
/**
 * Validate port number
 */
function validatePort(port) {
    const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
    if (isNaN(portNum) || portNum < constants_1.PORT_MIN || portNum > constants_1.PORT_MAX) {
        throw new Error((0, constants_1.PORT_VALIDATION_ERROR_MESSAGE)(constants_1.PORT_MIN, constants_1.PORT_MAX));
    }
    return portNum;
}
/**
 * Create Express app for dashboard with middleware
 */
function createDashboardApp() {
    const app = (0, express_1.default)();
    // Timeout middleware
    app.use((0, security_1.createTimeoutMiddleware)());
    // Security setup
    const serverHost = config_loader_1.appConfig.server.host === '0.0.0.0'
        ? 'localhost'
        : config_loader_1.appConfig.server.host;
    const apiUrl = (0, security_1.buildApiUrl)(serverHost, config_loader_1.appConfig.server.port);
    app.use((0, security_1.createHelmetMiddleware)(apiUrl));
    app.use((0, security_1.createDashboardCorsMiddleware)());
    // Environment config endpoint
    app.get('/env-config.js', (_req, res) => {
        res.setHeader('Content-Type', constants_1.CONTENT_TYPE_JAVASCRIPT);
        res.setHeader('Cache-Control', constants_1.CACHE_CONTROL_NO_CACHE);
        res.send(`window.ENV = { API_URL: "${apiUrl}" };`);
    });
    // Request logging
    app.use(logger_1.httpLogger);
    // SPA routing: serve index.html for non-static routes
    app.use((_req, _res, next) => {
        if (constants_1.STATIC_FILE_PATTERN.test(_req.path)) {
            next();
        }
        else {
            _res.header('Cache-Control', constants_1.CACHE_CONTROL_NO_CACHE);
            _res.header('Expires', constants_1.EXPIRES_HEADER);
            _res.header('Pragma', constants_1.PRAGMA_HEADER);
            _res.sendFile('index.html', {
                root: path_1.default.resolve(__dirname, '..', '..', 'monodog-dashboard', 'dist'),
            }, (err) => {
                if (err) {
                    logger_1.AppLogger.error(constants_1.ERROR_SERVING_INDEX_HTML, err);
                    _res.status(500).json({ error: 'Internal server error' });
                }
            });
        }
    });
    // Static files
    const staticPath = path_1.default.join(__dirname, '..', '..', 'monodog-dashboard', 'dist');
    logger_1.AppLogger.debug('Serving static files from:', { path: staticPath });
    app.use(express_1.default.static(staticPath, {
        maxAge: '1d',
        etag: false,
        dotfiles: 'deny',
    }));
    // Global error handler (must be last)
    app.use(error_handler_1.errorHandler);
    return app;
}
/**
 * Start the dashboard server
 */
function serveDashboard(rootPath) {
    try {
        const port = config_loader_1.appConfig.dashboard.port;
        const host = config_loader_1.appConfig.dashboard.host;
        const validatedPort = validatePort(port);
        const app = createDashboardApp();
        const server = app.listen(validatedPort, host, () => {
            console.log((0, constants_1.SUCCESS_DASHBOARD_START)(host, validatedPort));
            console.log('Press Ctrl+C to quit.');
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger_1.AppLogger.error((0, constants_1.ERROR_PORT_IN_USE)(validatedPort), err);
                process.exit(1);
            }
            else if (err.code === 'EACCES') {
                logger_1.AppLogger.error((0, constants_1.ERROR_PERMISSION_DENIED)(validatedPort), err);
                process.exit(1);
            }
            else {
                logger_1.AppLogger.error('Server failed to start:', err);
                process.exit(1);
            }
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger_1.AppLogger.info(constants_1.MESSAGE_DASHBOARD_GRACEFUL_SHUTDOWN);
            server.close(() => {
                logger_1.AppLogger.info(constants_1.MESSAGE_DASHBOARD_CLOSED);
                process.exit(0);
            });
        });
    }
    catch (error) {
        const err = error;
        logger_1.AppLogger.error('Failed to start dashboard:', err);
        process.exit(1);
    }
}
