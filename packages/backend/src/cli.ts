#!/usr/bin/env node

/**
 * CLI Entry Point for the Monorepo Analysis Engine.
 * * This script is executed when a user runs the `monodog-cli` command
 * in their project. It handles command-line arguments to determine
 * whether to:
 * 1. Start the API server for the dashboard.
 * 2. Run a one-off analysis command. (Future functionality)
 */
import * as fs from 'fs';

import * as path from 'path';
import { startServer } from './index'; // Assume index.ts exports this function

// --- Argument Parsing ---

// 1. Get arguments excluding the node executable and script name
const args = process.argv.slice(2);

// Default settings
let serve = false;
let rootPath = process.cwd(); // Default to the current working directory

// Simple argument parsing loop
for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--serve') {
        serve = true;
    } else if (arg === '--root') {
        // Look at the next argument for the path
        if (i + 1 < args.length) {
            rootPath = path.resolve(args[i + 1]);
            i++; // Skip the next argument since we've consumed it
        } else {
            console.error('Error: --root requires a path argument.');
            process.exit(1);
        }
    } else if (arg === '-h' || arg === '--help') {
        console.log(`
Monodog CLI - Monorepo Analysis Engine

Usage:
  monodog-cli [options]

Options:
  --serve            Start the Monorepo Dashboard API server (default: off).
  --root <path>      Specify the root directory of the monorepo to analyze (default: current working directory).
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
    startServer(rootPath);
    copyPackageToWorkspace(rootPath);
} else {
    // Default mode: print usage or run a default report if no command is specified
    console.log(`Monodog CLI: No operation specified. Use --serve to start the API or -h for help. Ex: pnpm monodog-cli @monodog/dashboard --serve --root .`);
}

/**
 * Copies an installed NPM package from node_modules into the local packages/ workspace directory.
 */
function copyPackageToWorkspace(rootDir: string): void  {
    // 1. Get package name from arguments
    // The package name is expected as the first command-line argument (process.argv[2])
    const packageName = process.argv[2];

    if (!packageName || packageName.startsWith('--')) {
        console.error("Error: Please provide the package name as an argument if you want to setup dashboard.");
        console.log("Usage: pnpm monodog-cli @monodog/dashboard --serve --root .");
    }
    if(packageName !== '@monodog/dashboard'){
        console.log("\n--- Skipping workspace setup for @monodog/dashboard to avoid self-copying. ---");
        return;
    }

    // const rootDir = process.cwd();
    const sourcePath = path.join(rootDir, 'node_modules', packageName);

    // Convert package name to a valid folder name (e.g., @scope/name -> scope-name)
    // This is optional but makes file paths cleaner.
    const folderName = packageName.replace('@', '').replace('/', '-');
    const destinationPath = path.join(rootDir, 'packages', folderName);

    console.log(`\n--- Monorepo Workspace Conversion ---`);
    console.log(`Target Package: ${packageName}`);
    console.log(`New Workspace:  packages/${folderName}`);
    console.log(`-----------------------------------`);


    // 2. Validate Source existence
    if (!fs.existsSync(sourcePath)) {
        console.error(`\n❌ Error: Source package not found at ${sourcePath}.`);
        console.error("Please ensure the package is installed via 'pnpm install <package-name>' first.");
        process.exit(1);
    }

    // 3. Validate Destination existence (prevent accidental overwrite)
    if (fs.existsSync(destinationPath)) {
        console.error(`\n❌ Error: Destination directory already exists at ${destinationPath}.`);
        console.error("Please manually remove it or rename it before running the script.");
        process.exit(1);
    }

    // Ensure the 'packages' directory exists
    const packagesDir = path.join(rootDir, 'packages');
    if (!fs.existsSync(packagesDir)) {
        fs.mkdirSync(packagesDir, { recursive: true });
        console.log(`Created packages directory: ${packagesDir}`);
    }

    // 4. Perform the copy operation
    try {
        console.log(`\nCopying files from ${sourcePath} to ${destinationPath}...`);

        // fs.cpSync provides cross-platform recursive copying (Node 16.7+)
        fs.cpSync(sourcePath, destinationPath, {
            recursive: true,
            dereference: true,
            // Filter out node_modules inside the package itself to avoid deep recursion
            // filter: (src: string): boolean => !src.includes('node_modules'),
        });

        console.log(`\n✅ Success! Contents of '${packageName}' copied to '${destinationPath}'`);

        // Post-copy instructions
        console.log("\n*** IMPORTANT NEXT STEPS (MANDATORY) ***");
        console.log("1.Migrate Database:");
        console.log(`   - pnpm prisma migrate --schema ./node_modules/@monodog/backend/prisma/schema.prisma`);
        console.log("2. Generate Client:");
        console.log(`   - pnpm exec prisma generate --schema ./node_modules/@monodog/backend/prisma/schema.prisma`);
        console.log("3. Run Backend app server with dashboard setup");
        console.log(`   - pnpm monodog-cli @monodog/dashboard --serve --root .`);

    } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Failed to copy files: ${message}`);
    process.exit(1);
  }
}

