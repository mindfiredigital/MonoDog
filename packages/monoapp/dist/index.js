"use strict";
/**
 * Monodog Application Entry Point
 *
 * This file exports the main server and dashboard startup functions
 * All middleware, security, and error handling logic has been moved to separate files
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveDashboard = exports.startServer = void 0;
var server_startup_1 = require("./middleware/server-startup");
Object.defineProperty(exports, "startServer", { enumerable: true, get: function () { return server_startup_1.startServer; } });
var dashboard_startup_1 = require("./middleware/dashboard-startup");
Object.defineProperty(exports, "serveDashboard", { enumerable: true, get: function () { return dashboard_startup_1.serveDashboard; } });
