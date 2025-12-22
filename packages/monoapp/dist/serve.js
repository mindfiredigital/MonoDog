#!/usr/bin/env node
"use strict";
/**
 * CLI Entry Point for serving Monodog.
 * * This script is executed when a user runs the serve command
 * in their project. It handles command-line arguments to determine
 * whether to:
 * 1. Start the API server for the dashboard.
 * 2. Start serving the dashboard frontend.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const index_1 = require("./index"); // Assume index.ts exports this function
const config_loader_1 = require("./config-loader");
const fs_1 = __importDefault(require("fs"));
// --- Argument Parsing ---
// 1. Get arguments excluding the node executable and script name
const args = process.argv.slice(2);
// Default settings
const DEFAULT_PORT = 8999;
const rootPath = findMonorepoRoot();
const port = config_loader_1.appConfig.server.port ?? DEFAULT_PORT; //Default port
const host = config_loader_1.appConfig.server.host ?? 'localhost'; //Default host
// --- Execution Logic ---
console.log(`Starting Monodog API server...`);
console.log(`Analyzing monorepo at root: ${rootPath}`);
// Start the Express server and begin analysis
(0, index_1.startServer)(rootPath, port, host);
(0, index_1.serveDashboard)(path.join(rootPath), config_loader_1.appConfig.dashboard.port, config_loader_1.appConfig.dashboard.host);
/**
 * Find the monorepo root by looking for package.json with workspaces or pnpm-workspace.yaml
 */
function findMonorepoRoot() {
    let currentDir = __dirname;
    while (currentDir !== path.parse(currentDir).root) {
        const packageJsonPath = path.join(currentDir, 'package.json');
        const pnpmWorkspacePath = path.join(currentDir, 'pnpm-workspace.yaml');
        // Check if this directory has package.json with workspaces or pnpm-workspace.yaml
        if (fs_1.default.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf8'));
                // If it has workspaces or is the root monorepo package
                if (packageJson.workspaces || fs_1.default.existsSync(pnpmWorkspacePath)) {
                    console.log('✅ Found monorepo root:', currentDir);
                    return currentDir;
                }
            }
            catch (error) {
                // Continue searching if package.json is invalid
            }
        }
        // Check if we're at the git root
        const gitPath = path.join(currentDir, '.git');
        if (fs_1.default.existsSync(gitPath)) {
            console.log('✅ Found git root (likely monorepo root):', currentDir);
            return currentDir;
        }
        // Go up one directory
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir)
            break; // Prevent infinite loop
        currentDir = parentDir;
    }
    // Fallback to process.cwd() if we can't find the root
    console.log('⚠️ Could not find monorepo root, using process.cwd():', process.cwd());
    return process.cwd();
}
