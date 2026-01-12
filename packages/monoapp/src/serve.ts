#!/usr/bin/env node

/**
 * CLI Entry Point for serving Monodog.
 * This script is executed when a user runs the serve command
 * in their project. It handles command-line arguments to determine
 * whether to:
 * 1. Start the API server for the dashboard.
 * 2. Start serving the dashboard frontend.
 */

import { startServer, serveDashboard } from './index';
import { findMonorepoRoot } from './utils/utilities';

const rootPath = findMonorepoRoot();

console.log(`Starting Monodog API server...`);
console.log(`Analyzing monorepo at root: ${rootPath}`);

// Start the Express server and dashboard

startServer(rootPath);

serveDashboard(rootPath);

