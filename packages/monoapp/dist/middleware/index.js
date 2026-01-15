"use strict";
/**
 * Middleware exports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLogger = exports.httpLogger = exports.serveDashboard = exports.startServer = exports.buildDashboardUrl = exports.buildApiUrl = exports.createTimeoutMiddleware = exports.createDashboardCorsMiddleware = exports.createApiCorsMiddleware = exports.createHelmetMiddleware = exports.notFoundHandler = exports.errorHandler = void 0;
var error_handler_1 = require("./error-handler");
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return error_handler_1.errorHandler; } });
Object.defineProperty(exports, "notFoundHandler", { enumerable: true, get: function () { return error_handler_1.notFoundHandler; } });
var security_1 = require("./security");
Object.defineProperty(exports, "createHelmetMiddleware", { enumerable: true, get: function () { return security_1.createHelmetMiddleware; } });
Object.defineProperty(exports, "createApiCorsMiddleware", { enumerable: true, get: function () { return security_1.createApiCorsMiddleware; } });
Object.defineProperty(exports, "createDashboardCorsMiddleware", { enumerable: true, get: function () { return security_1.createDashboardCorsMiddleware; } });
Object.defineProperty(exports, "createTimeoutMiddleware", { enumerable: true, get: function () { return security_1.createTimeoutMiddleware; } });
Object.defineProperty(exports, "buildApiUrl", { enumerable: true, get: function () { return security_1.buildApiUrl; } });
Object.defineProperty(exports, "buildDashboardUrl", { enumerable: true, get: function () { return security_1.buildDashboardUrl; } });
var server_startup_1 = require("./server-startup");
Object.defineProperty(exports, "startServer", { enumerable: true, get: function () { return server_startup_1.startServer; } });
var dashboard_startup_1 = require("./dashboard-startup");
Object.defineProperty(exports, "serveDashboard", { enumerable: true, get: function () { return dashboard_startup_1.serveDashboard; } });
var logger_1 = require("./logger");
Object.defineProperty(exports, "httpLogger", { enumerable: true, get: function () { return logger_1.httpLogger; } });
Object.defineProperty(exports, "AppLogger", { enumerable: true, get: function () { return logger_1.AppLogger; } });
