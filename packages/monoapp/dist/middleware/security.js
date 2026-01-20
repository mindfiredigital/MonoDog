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
const constants_1 = require("../constants");
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
        methods: [...constants_1.CORS_API_METHODS],
        allowedHeaders: [...constants_1.CORS_ALLOWED_HEADERS],
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
        req.setTimeout(constants_1.REQUEST_TIMEOUT);
        res.setTimeout(constants_1.RESPONSE_TIMEOUT);
        next();
    };
}
/**
 * Build API URL based on config
 */
function buildApiUrl(host, port) {
    const apiHost = host === constants_1.WILDCARD_ADDRESS ? constants_1.DEFAULT_LOCALHOST : host;
    return `${constants_1.HTTP_PROTOCOL}${apiHost}:${port}`;
}
/**
 * Build dashboard URL based on config
 */
function buildDashboardUrl(config) {
    const dashboardHost = config.dashboard.host === constants_1.WILDCARD_ADDRESS
        ? constants_1.DEFAULT_LOCALHOST
        : config.dashboard.host;
    return `${constants_1.HTTP_PROTOCOL}${dashboardHost}:${config.dashboard.port}`;
}
