#!/usr/bin/env node

/**
 * CLI Entry Point for the Setting up workspace.
 * * This script is executed when a user runs the setup command
 * in their project. It handles command-line arguments to determine
 * whether to:
 * 1. Copy monodog to workspace.
 */
import * as fs from 'fs';

import * as path from 'path';

import { appConfig } from './config-loader';

// --- Argument Parsing ---

// 1. Get arguments excluding the node executable and script name
const args = process.argv.slice(2);

// Default settings
let rootPath = path.resolve(appConfig.workspace.root_dir ?? process.cwd()); // Default to the current working directory ?(inside node modules)
const host = appConfig.server.host ?? 'localhost'; //Default host

console.log('rp1', rootPath);
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
console.log('rp2', rootPath);

// --- Execution Logic ---

console.log(`\nInitializing Setup...`);

copyPackageToWorkspace(rootPath);
console.log('\n*** Run the server ***');
console.log('npm --workspace @monodog/monoapp run serve');
process.exit(0);

/**
 * Copies an installed NPM package from node_modules into the local install_path workspace directory.
 */
function copyPackageToWorkspace(rootDir: string): void {
  // 1. Get package name from arguments
  // The package name is expected as the first command-line argument (process.argv[2])
  const packageName = process.argv[2];

  if (!packageName || packageName.startsWith('--')) {
    console.error(
      'Error: Please provide the package name as an argument if you want to setup dashboard.'
    );
    console.log('Usage: pnpm monodog-cli @monodog/dashboard --serve --root .');
  }
  const sourcePath = path.join(rootDir, 'node_modules', packageName);

  // Convert package name to a valid folder name (e.g., @scope/name -> scope-name)
  // This is optional but makes file paths cleaner.
  const folderName = packageName.replace('@', '').replace('/', '-');
  const destinationPath = path.join(
    rootDir,
    appConfig.workspace.install_path,
    folderName
  );

  console.log(`\n--- Monorepo Workspace Conversion ---`);
  console.log(`Target Package: ${packageName}`);
  console.log(
    `New Workspace:  ${appConfig.workspace.install_path}/${folderName}`
  );
  console.log(`-----------------------------------`);

  // 2. Validate Source existence
  if (!fs.existsSync(sourcePath)) {
    console.error(`\n❌ Error: Source package not found at ${sourcePath}.`);
    console.error(
      "Please ensure the package is installed via 'pnpm install <package-name>' first."
    );
    process.exit(1);
  }

  // Check if source path exists and is a directory before copying
  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isDirectory()) {
    console.error(
      `\n❌ Fatal Error: Source package directory not found or is not a directory.`
    );
    console.error(`Attempted source path: ${sourcePath}`);
    console.error(
      `This likely means the package '${packageName}' was not fully installed or is improperly linked by the package manager.`
    );
    process.exit(1);
  }

  // 3. Handle Destination existence: Delete if found to allow clean re-setup
  if (fs.existsSync(destinationPath)) {
    console.log(
      `\n⚠️ Warning: Destination directory already exists at ${destinationPath}.`
    );
    console.log(`\nSkipping Setup.`);
    process.exit(0);
  }

  // Ensure the 'install_path' directory exists
  const packagesDir = path.join(rootDir, appConfig.workspace.install_path);
  if (!fs.existsSync(packagesDir)) {
    fs.mkdirSync(packagesDir, { recursive: true });
    console.log(
      `Created ${appConfig.workspace.install_path} directory: ${packagesDir}`
    );
  }

  // 4. Perform the copy operation
  try {
    console.log(`\nCopying files from ${sourcePath} to ${destinationPath}...`);

    // fs.cpSync provides cross-platform recursive copying (Node 16.7+)
    // Added filter to exclude node_modules, dist, and cache folders from the copy,
    // which prevents recursive errors and corrupted copies.
    // const INCLUDED_ROOT_ITEMS = ['package.json', 'README.md', 'dist', 'monodog-conf.json', 'monodog-dashboard'];

        fs.cpSync(sourcePath, destinationPath, {
            recursive: true,
            dereference: true,
            // filter: (src: string): boolean => {
            //     const relative = path.relative(sourcePath, src);

            //     // 1. Always include the source root itself to initiate the copy
            //     if (relative === '') {
            //         return true;
            //     }

            //     // 2. Get the top-level path segment (e.g., 'dist', 'prisma', 'package.json')
            //     // This is the file/directory name immediately under the source path.
            //     const topLevelItem = relative.split(path.sep)[0];

            //     // 3. Include if the top-level item is one of the desired items.
            //     if (INCLUDED_ROOT_ITEMS.includes(topLevelItem)) {
            //         return true;
            //     }

            //     // 4. Exclude everything else (like /src, /test, /node_modules, etc.)
            //     return false;
            // }
          // filter: (src: string): boolean => {
          //   const basename = path.basename(src);
          //   return !(['node_modules', '.turbo'].includes(basename));
          // }

      // Filter out node_modules inside the package itself to avoid deep recursion
      // filter: (src: string): boolean => !src.includes('node_modules'),
    });

    console.log(
      `\n✅ Success! Contents of '${packageName}' copied to '${destinationPath}'`
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Failed to copy files: ${message}`);
    process.exit(1);
  }
}
