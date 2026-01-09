"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
exports.serveDashboard = serveDashboard;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = require("body-parser");
const config_loader_1 = require("./config-loader");
const packageRoutes_1 = __importDefault(require("./routes/packageRoutes"));
const commitRoutes_1 = __importDefault(require("./routes/commitRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const configRoutes_1 = __importDefault(require("./routes/configRoutes"));
// The main function exported and called by the CLI
function startServer(rootPath, port, host) {
    const app = (0, express_1.default)();
    app.locals.rootPath = rootPath;
    // --- Middleware ---
    // 1. Logging Middleware
    app.use((_req, _res, next) => {
        console.log(`[SERVER] ${_req.method} ${_req.url} (Root: ${rootPath})`);
        next();
    });
    app.use((0, cors_1.default)());
    app.use((0, body_parser_1.json)());
    app.use('/api/packages', packageRoutes_1.default);
    // Get commit details
    app.use('/api/commits/', commitRoutes_1.default);
    // ---------- HEALTH --------------------
    app.use('/api/health/', healthRoutes_1.default);
    // ------------------------- CONFIGURATION TAB ------------------------- //
    // Get all configuration files from the file system
    app.use('/api/config/', configRoutes_1.default);
    // 404 handler
    app.use('*', (_, res) => {
        res.status(404).json({
            error: 'Endpoint not found',
            timestamp: Date.now(),
        });
    });
    const PORT = parseInt(port ? port.toString() : '4000');
    app
        .listen(PORT, host, async () => {
        console.log(`🚀 Backend server running on http://${host}:${PORT}`);
        console.log(`📊 API endpoints available:`);
        console.log(`   - GET  /api/health`);
        console.log(`   - GET  /api/packages/refresh`);
        console.log(`   - GET  /api/packages`);
        console.log(`   - GET  /api/packages/:name`);
        console.log(`   - PUT  /api/packages/update-config`);
        console.log(`   - GET  /api/commits/:packagePath`);
        console.log(`   - GET  /api/health/packages`);
        console.log(`   - PUT  /api/config/files/:id`);
        console.log(`   - GET  /api/config/files`);
    })
        .on('error', err => {
        // Handle common errors like EADDRINUSE (port already in use)
        if (err.message.includes('EADDRINUSE')) {
            console.error(`Error: Port ${port} is already in use. Please specify a different port via configuration file.`);
            process.exit(1);
        }
        else {
            console.error('Server failed to start:', err);
            process.exit(1);
        }
    });
}
function serveDashboard(rootPath, port, host) {
    const app = (0, express_1.default)();
    app.get('/env-config.js', (req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.send(`window.ENV = { API_URL: "${`${config_loader_1.appConfig.server.host}:${config_loader_1.appConfig.server.port}` || 'localhost:8999'}" };`);
    });
    // This code makes sure that any request that does not matches a static file
    // in the build folder, will just serve index.html. Client side routing is
    // going to make sure that the correct content will be loaded.
    app.use((req, res, next) => {
        if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
            next();
        }
        else {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
            res.sendFile('index.html', {
                root: path_1.default.resolve(__dirname, '..', 'monodog-dashboard', 'dist'),
            });
        }
    });
    const staticPath = path_1.default.join(__dirname, '..', 'monodog-dashboard', 'dist');
    console.log('Serving static files from:', staticPath);
    app.use(express_1.default.static(staticPath));
    // Start the server
    const PORT = parseInt(port ? port.toString() : '8999');
    app.listen(PORT, host, () => {
        console.log(`App listening on ${host}:${port}`);
        console.log('Press Ctrl+C to quit.');
    });
}
