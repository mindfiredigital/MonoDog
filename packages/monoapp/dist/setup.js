#!/usr/bin/env node
"use strict";
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
/**
 * CLI Entry Point for the Monorepo Analysis Engine.
 * * This script is executed when a user runs the `monodog-cli` command
 * in their project. It handles command-line arguments to determine
 * whether to:
 * 1. Start the API server for the dashboard.
 * 2. Run a one-off analysis command. (Future functionality)
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const index_1 = require("./index"); // Assume index.ts exports this function
const config_loader_1 = require("./config-loader");
// const appConfig = loadConfig();
// --- Argument Parsing ---
// 1. Get arguments excluding the node executable and script name
const args = process.argv.slice(2);
// Default settings
const DEFAULT_PORT = 8999;
let rootPath = path.resolve(config_loader_1.appConfig.workspace.root_dir ?? process.cwd()); // Default to the current working directory
let port = config_loader_1.appConfig.server.port ?? DEFAULT_PORT; //Default port
const host = config_loader_1.appConfig.server.host ?? 'localhost'; //Default host
let serve = false;
// Simple argument parsing loop
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--serve') {
        serve = true;
    }
    else if (arg === '--root') {
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
    else if (arg === '--port') {
        // Look at the next argument for the port number
        if (i + 1 < args.length) {
            const portValue = parseInt(args[i + 1], 10);
            if (isNaN(portValue) || portValue <= 0 || portValue > 65535) {
                console.error('Error: --port requires a valid port number (1-65535).');
                process.exit(1);
            }
            port = portValue;
            i++; // Skip the next argument
        }
        else {
            console.error('Error: --port requires a number argument.');
            process.exit(1);
        }
    }
    else if (arg === '-h' || arg === '--help') {
        console.log(`
Monodog CLI - Monorepo Analysis Engine

Usage:
  monodog-cli [options]

Options:
  --serve            Start the Monorepo Dashboard API server (default: off).
  --root <path>      Specify the root directory of the monorepo to analyze (default: current working directory).
  --port <number>    Specify the port for the API server (default: 4000).
  -h, --help         Show this help message.

Example:
  monodog-cli --serve --root /path/to/my/monorepo
        `);
        process.exit(0);
    }
}
// --- Execution Logic ---
if (serve) {
    console.log(`Starting Monodog API server...`);
    console.log(`Analyzing monorepo at root: ${rootPath}`);
    // Start the Express server and begin analysis
    (0, index_1.startServer)(rootPath, port, host);
    (0, index_1.serveDashboard)(path.join(rootPath, config_loader_1.appConfig.workspace.install_path), config_loader_1.appConfig.dashboard.port, config_loader_1.appConfig.dashboard.host);
}
else {
    console.log(`\nInitializing Setup...`);
    copyPackageToWorkspace(rootPath);
    console.log("\n*** Run the server ***");
    console.log("npm --workspace @monodog/monoapp run serve");
    process.exit(0);
}
/**
 * Copies an installed NPM package from node_modules into the local install_path workspace directory.
 */
function copyPackageToWorkspace(rootDir) {
    // 1. Get package name from arguments
    // The package name is expected as the first command-line argument (process.argv[2])
    const packageName = process.argv[2];
    if (!packageName || packageName.startsWith('--')) {
        console.error("Error: Please provide the package name as an argument if you want to setup dashboard.");
        console.log("Usage: pnpm monodog-cli @monodog/dashboard --serve --root .");
    }
    // --- FIX: Robust Source Path Resolution for pnpm/symlinks ---
    // let sourcePath: string;
    // try {
    //     // Use resolvePath.resolve to find a known file in the package (e.g., its package.json)
    //     // and backtrack to the package root. This correctly resolves symlinks (like those created by pnpm).
    //     // Find the package.json location relative to the project root
    //     // Using { paths: [rootDir] } ensures we search relative to the monorepo root.
    //     const packageJsonPath = resolvePath.resolve(packageName + '/package.json', { paths: [rootDir] });
    //     // The source path is the directory containing the package.json
    //     sourcePath = path.dirname(packageJsonPath);
    // } catch (e) {
    //     // If require.resolve fails (package not found), handle the error.
    //     console.error(`\n❌ Error resolving package path for ${packageName}.`);
    //     console.error("The package likely wasn't installed correctly or is not accessible from the root context.");
    //     process.exit(1);
    // }
    // const rootDir = process.cwd();
    const sourcePath = path.join(rootDir, 'node_modules', packageName);
    // Convert package name to a valid folder name (e.g., @scope/name -> scope-name)
    // This is optional but makes file paths cleaner.
    const folderName = packageName.replace('@', '').replace('/', '-');
    const destinationPath = path.join(rootDir, config_loader_1.appConfig.workspace.install_path, folderName);
    console.log(`\n--- Monorepo Workspace Conversion ---`);
    console.log(`Target Package: ${packageName}`);
    console.log(`New Workspace:  ${config_loader_1.appConfig.workspace.install_path}/${folderName}`);
    console.log(`-----------------------------------`);
    // 2. Validate Source existence
    if (!fs.existsSync(sourcePath)) {
        console.error(`\n❌ Error: Source package not found at ${sourcePath}.`);
        console.error("Please ensure the package is installed via 'pnpm install <package-name>' first.");
        process.exit(1);
    }
    // Check if source path exists and is a directory before copying
    if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isDirectory()) {
        console.error(`\n❌ Fatal Error: Source package directory not found or is not a directory.`);
        console.error(`Attempted source path: ${sourcePath}`);
        console.error(`This likely means the package '${packageName}' was not fully installed or is improperly linked by the package manager.`);
        process.exit(1);
    }
    // 3. Handle Destination existence: Delete if found to allow clean re-setup
    if (fs.existsSync(destinationPath)) {
        console.log(`\n⚠️ Warning: Destination directory already exists at ${destinationPath}.`);
        console.log(`\nSkipping Setup.`);
        process.exit(0);
    }
    // Ensure the 'install_path' directory exists
    const packagesDir = path.join(rootDir, config_loader_1.appConfig.workspace.install_path);
    if (!fs.existsSync(packagesDir)) {
        fs.mkdirSync(packagesDir, { recursive: true });
        console.log(`Created ${config_loader_1.appConfig.workspace.install_path} directory: ${packagesDir}`);
    }
    // 4. Perform the copy operation
    try {
        console.log(`\nCopying files from ${sourcePath} to ${destinationPath}...`);
        // fs.cpSync provides cross-platform recursive copying (Node 16.7+)
        // Added filter to exclude node_modules, dist, and cache folders from the copy,
        // which prevents recursive errors and corrupted copies.
        fs.cpSync(sourcePath, destinationPath, {
            recursive: true,
            dereference: true,
            // filter: (src: string): boolean => {
            //     const basename = path.basename(src);
            //     return !(['node_modules', 'dist', 'out', '.cache'].includes(basename));
            // }
            // Filter out node_modules inside the package itself to avoid deep recursion
            // filter: (src: string): boolean => !src.includes('node_modules'),
        });
        console.log(`\n✅ Success! Contents of '${packageName}' copied to '${destinationPath}'`);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`\n❌ Failed to copy files: ${message}`);
        process.exit(1);
    }
}
