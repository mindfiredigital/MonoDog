#!/usr/bin/env node
"use strict";
/**
 * CLI Entry Point for serving Monodog.
 * This script is executed when a user runs the serve command
 * in their project. It handles command-line arguments to determine
 * whether to:
 * 1. Start the API server for the dashboard.
 * 2. Start serving the dashboard frontend.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const utilities_1 = require("./utils/utilities");
let logLevel = '';
let nodeEnv = 'production';
const args = process.argv;
if (args.includes('--dev')) {
    nodeEnv = 'development';
}
// Priority: Check for debug first, then fall back to info
if (args.includes('--debug')) {
    logLevel = 'debug';
}
else if (args.includes('--info')) {
    logLevel = 'info';
}
process.env.LOG_LEVEL = logLevel;
process.env.NODE_ENV = nodeEnv;
const rootPath = (0, utilities_1.findMonorepoRoot)();
// Start the Express server and dashboard
(0, index_1.startServer)(rootPath);
(0, index_1.serveDashboard)(rootPath);
