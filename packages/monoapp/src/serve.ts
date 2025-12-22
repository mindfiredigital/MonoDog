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
import fs from 'fs';

// --- Argument Parsing ---

// 1. Get arguments excluding the node executable and script name
const args = process.argv.slice(2);

// Default settings
const DEFAULT_PORT = 8999;
const rootPath = findMonorepoRoot();
const port = appConfig.server.port ?? DEFAULT_PORT; //Default port
const host = appConfig.server.host ?? 'localhost'; //Default host


// --- Execution Logic ---

console.log(`Starting Monodog API server...`);
console.log(`Analyzing monorepo at root: ${rootPath}`);
// Start the Express server and begin analysis
startServer(rootPath, port, host);
serveDashboard(
  path.join(rootPath),
  appConfig.dashboard.port,
  appConfig.dashboard.host
);

  /**
   * Find the monorepo root by looking for package.json with workspaces or pnpm-workspace.yaml
   */
  function findMonorepoRoot(): string {
    let currentDir = __dirname;

    while (currentDir !== path.parse(currentDir).root) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      const pnpmWorkspacePath = path.join(currentDir, 'pnpm-workspace.yaml');

      // Check if this directory has package.json with workspaces or pnpm-workspace.yaml
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, 'utf8')
          );
          // If it has workspaces or is the root monorepo package
          if (packageJson.workspaces || fs.existsSync(pnpmWorkspacePath)) {
            console.log('✅ Found monorepo root:', currentDir);
            return currentDir;
          }
        } catch (error) {
          // Continue searching if package.json is invalid
        }
      }

      // Check if we're at the git root
      const gitPath = path.join(currentDir, '.git');
      if (fs.existsSync(gitPath)) {
        console.log('✅ Found git root (likely monorepo root):', currentDir);
        return currentDir;
      }

      // Go up one directory
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Prevent infinite loop
      currentDir = parentDir;
    }

    // Fallback to process.cwd() if we can't find the root
    console.log(
      '⚠️ Could not find monorepo root, using process.cwd():',
      process.cwd()
    );
    return process.cwd();
  }
