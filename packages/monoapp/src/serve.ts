#!/usr/bin/env node

/**
 * CLI Entry Point for serving Monodog.
 * * This script is executed when a user runs the serve command
 * in their project. It handles command-line arguments to determine
 * whether to:
 * 1. Start the API server for the dashboard.
 * 2. Start serving the dashboard frontend.
 */

import * as path from 'path';
import { startServer, serveDashboard } from './index'; // Assume index.ts exports this function

import { appConfig } from './config-loader';


// --- Argument Parsing ---

// 1. Get arguments excluding the node executable and script name
const args = process.argv.slice(2);

// Default settings
const DEFAULT_PORT = 8999;
let rootPath = path.resolve(process.cwd()); // Default to the current working directory
const port = appConfig.server.port ?? DEFAULT_PORT; //Default port
const host = appConfig.server.host ?? 'localhost'; //Default host

// Simple argument parsing loop
for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--root') {
    // Look at the next argument for the path
    if (i + 1 < args.length) {
      rootPath = path.resolve(args[i + 1]);
      i++; // Skip the next argument since we've consumed it
    } else {
      console.error('Error: --root requires a path argument.');
      process.exit(1);
    }
  }
}

// --- Execution Logic ---

console.log(`Starting Monodog API server...`);
console.log(`Analyzing monorepo at root: ${rootPath}`);
// Start the Express server and begin analysis
startServer(rootPath, port, host);
serveDashboard(path.join(rootPath, appConfig.workspace.install_path), appConfig.dashboard.port, appConfig.dashboard.host);


