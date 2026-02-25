#!/usr/bin/env node

/**
 * CLI Entry Point for serving Monodog.
 * This script is executed when a user runs the serve command
 * in their project. It handles command-line arguments to determine
 * whether to:
 * 1. Start the API server for the dashboard.
 * 2. Start serving the dashboard frontend.
 */

import dotenv from 'dotenv';
import path from 'path';
import { startServer, serveDashboard } from './index';
import { findMonorepoRoot } from './utils/utilities';

let logLevel = process.env.LOG_LEVEL || 'info';
let nodeEnv = process.env.NODE_ENV || 'production';

const args = process.argv;

if (args.includes('--dev')) {
  nodeEnv = 'development';
}

// Priority: Check for debug first, then fall back to info
if (args.includes('--debug')) {
  logLevel = 'debug';
} else if (args.includes('--info')) {
  logLevel = 'info';
}
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

process.env.LOG_LEVEL = logLevel;
process.env.NODE_ENV = nodeEnv

const rootPath = findMonorepoRoot();

// Start the Express server and dashboard

startServer(rootPath);

serveDashboard(rootPath);

