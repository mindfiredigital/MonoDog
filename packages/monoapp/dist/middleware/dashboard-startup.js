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
const config_loader_1 = require("../config-loader");
const error_handler_1 = require("./error-handler");
const security_1 = require("./security");
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
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.send(`window.ENV = { API_URL: "${apiUrl}" };`);
    });
    // Request logging
    app.use(error_handler_1.requestLogger);
    // SPA routing: serve index.html for non-static routes
    app.use((_req, _res, next) => {
        if (/(.ico|.js|.css|.jpg|.png|.map|.woff|.woff2|.ttf)$/i.test(_req.path)) {
            next();
        }
        else {
            _res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            _res.header('Expires', '-1');
            _res.header('Pragma', 'no-cache');
            _res.sendFile('index.html', {
                root: path_1.default.resolve(__dirname, '..', '..', 'monodog-dashboard', 'dist'),
            }, (err) => {
                if (err) {
                    console.error('Error serving index.html:', err?.message);
                    _res.status(500).json({ error: 'Internal server error' });
                }
            });
        }
    });
    // Static files
    const staticPath = path_1.default.join(__dirname, '..', '..', 'monodog-dashboard', 'dist');
    console.log('Serving static files from:', staticPath);
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
            console.log(`Dashboard listening on http://${host}:${validatedPort}`);
            console.log('Press Ctrl+C to quit.');
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Error: Port ${validatedPort} is already in use.`);
                process.exit(1);
            }
            else if (err.code === 'EACCES') {
                console.error(`Error: Permission denied to listen on port ${validatedPort}.`);
                process.exit(1);
            }
            else {
                console.error('Server failed to start:', err.message);
                process.exit(1);
            }
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing dashboard server');
            server.close(() => {
                console.log('Dashboard server closed');
                process.exit(0);
            });
        });
    }
    catch (error) {
        const err = error;
        console.error('Failed to start dashboard:', err?.message || String(error));
        process.exit(1);
    }
}
