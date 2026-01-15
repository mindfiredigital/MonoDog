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
const rootPath = (0, utilities_1.findMonorepoRoot)();
console.log(`Starting Monodog API server...`);
console.log(`Analyzing monorepo at root: ${rootPath}`);
let logLevel = '';
let nodeEnv = 'production';
// Start the Express server and dashboard
process.argv.forEach(arg => {
    if (arg.startsWith('--dev')) {
        nodeEnv = 'development';
    }
    else if (arg === '--debug') {
        logLevel = 'debug';
    }
    else if (arg === '--info') {
        logLevel = 'info';
    }
});
process.env.LOG_LEVEL = logLevel;
process.env.NODE_ENV = nodeEnv;
(0, index_1.startServer)(rootPath);
(0, index_1.serveDashboard)(rootPath);
