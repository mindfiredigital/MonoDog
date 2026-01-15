"use strict";
/**
 * Security middleware and configuration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHelmetMiddleware = createHelmetMiddleware;
exports.createApiCorsMiddleware = createApiCorsMiddleware;
exports.createDashboardCorsMiddleware = createDashboardCorsMiddleware;
exports.createTimeoutMiddleware = createTimeoutMiddleware;
exports.buildApiUrl = buildApiUrl;
exports.buildDashboardUrl = buildDashboardUrl;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
/**
 * Create Helmet security middleware with Content Security Policy
 */
function createHelmetMiddleware(apiUrl) {
    return (0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", apiUrl, 'http://localhost:*', 'http://127.0.0.1:*'],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
    });
}
/**
 * Create CORS middleware for API server
 */
function createApiCorsMiddleware(dashboardUrl) {
    const corsOptions = {
        origin: dashboardUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    };
    return (0, cors_1.default)(corsOptions);
}
/**
 * Create CORS middleware for dashboard (no cross-origin)
 */
function createDashboardCorsMiddleware() {
    const corsOptions = {
        origin: false, // Don't allow any origin for static assets
    };
    return (0, cors_1.default)(corsOptions);
}
/**
 * Request timeout middleware (30 seconds)
 */
function createTimeoutMiddleware() {
    return (req, res, next) => {
        req.setTimeout(30000);
        res.setTimeout(30000);
        next();
    };
}
/**
 * Build API URL based on config
 */
function buildApiUrl(host, port) {
    const apiHost = host === '0.0.0.0' ? 'localhost' : host;
    return `http://${apiHost}:${port}`;
}
/**
 * Build dashboard URL based on config
 */
function buildDashboardUrl(config) {
    const dashboardHost = config.dashboard.host === '0.0.0.0'
        ? 'localhost'
        : config.dashboard.host;
    return `http://${dashboardHost}:${config.dashboard.port}`;
}
