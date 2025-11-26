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
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const index_1 = require("./index"); // Assume index.ts exports this function
const config_loader_1 = require("./config-loader");
// --- Argument Parsing ---
// 1. Get arguments excluding the node executable and script name
const args = process.argv.slice(2);
// Default settings
const DEFAULT_PORT = 8999;
let rootPath = path.resolve(process.cwd()); // Default to the current working directory
const port = config_loader_1.appConfig.server.port ?? DEFAULT_PORT; //Default port
const host = config_loader_1.appConfig.server.host ?? 'localhost'; //Default host
// Simple argument parsing loop
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--root') {
        // Look at the next argument for the path
        if (i + 1 < args.length) {
            rootPath = path.resolve(args[i + 1]);
            i++; // Skip the next argument since we've consumed it
        }
        else {
            console.error('Error: --root requires a path argument.');
            process.exit(1);
        }
    }
}
// --- Execution Logic ---
console.log(`Starting Monodog API server...`);
console.log(`Analyzing monorepo at root: ${rootPath}`);
// Start the Express server and begin analysis
(0, index_1.startServer)(rootPath, port, host);
(0, index_1.serveDashboard)(path.join(rootPath, config_loader_1.appConfig.workspace.install_path), config_loader_1.appConfig.dashboard.port, config_loader_1.appConfig.dashboard.host);
