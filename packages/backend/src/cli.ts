#!/usr/bin/env node

/**
 * CLI Entry Point for the Monorepo Analysis Engine.
 */
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { loadConfig } from './config-loader';

const appConfig = loadConfig();
const args = process.argv.slice(2);

const DEFAULT_PORT = 4000;
let rootPath = path.resolve(appConfig.workspace.root_dir ?? process.cwd());
let port = appConfig.server.port ?? DEFAULT_PORT;
const host = appConfig.server.host ?? 'localhost';

let serve = false;
let init = false;

// Simple argument parsing loop
if (args.length === 0) {
  init = true;
} else {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--serve') {
      serve = true;
    } else if (arg === '--root') {
      if (i + 1 < args.length) {
        rootPath = path.resolve(args[i + 1]);
        i++;
      } else {
        console.error('Error: --root requires a path argument.');
        process.exit(1);
      }
    } else if (arg === '--port') {
      if (i + 1 < args.length) {
        const portValue = parseInt(args[i + 1], 10);
        if (isNaN(portValue) || portValue <= 0 || portValue > 65535) {
          console.error(
            'Error: --port requires a valid port number (1-65535).'
          );
          process.exit(1);
        }
        port = portValue;
        i++;
      } else {
        console.error('Error: --port requires a number argument.');
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
  --port <number>    Specify the port for the API server (default: 4000).
  -h, --help         Show this help message.

Example:
  pnpm dlx @mindfiredigital/monodog                         (Initialize a new monodog environment)
  pnpm exec monodog-cli --serve --root /path/to/my/monorepo (Start the API server)
          `);
      process.exit(0);
    }
  }
}

const createConfigFileIfMissing = (rootPath: string): void => {
  // --- CONFIGURATION ---
  const configFileName = 'monodog-config.json';
  const configFilePath = path.resolve(rootPath, configFileName);

  // The default content for the configuration file
  const defaultContent = {
    workspace: {
      root_dir: '../', // We are inside monodog/ folder, so root is one level up
      install_path: 'packages',
    },
    database: {
      path: './monodog.db',
    },
    dashboard: {
      host: '0.0.0.0',
      port: '3010',
    },
    server: {
      host: '0.0.0.0',
      port: 4000,
    },
  };

  const contentString = JSON.stringify(defaultContent, null, 2);

  console.log(`\n[monodog] Checking for ${configFileName}...`);

  if (fs.existsSync(configFilePath)) {
    console.log(
      `[monodog] ${configFileName} already exists. Skipping creation.`
    );
  } else {
    try {
      fs.writeFileSync(configFilePath, contentString, 'utf-8');
      console.log(
        `[monodog] Successfully generated default ${configFileName} in the workspace root.`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[monodog Error] Failed to generate ${configFileName}:`,
        message
      );
    }
  }
};

const initMonodogEnvironment = (rootDir: string): void => {
  const monodogPath = path.join(rootDir, 'monodog');

  // Validate Destination existence
  if (fs.existsSync(monodogPath)) {
    console.error(`\nError: Directory already exists at ${monodogPath}.`);
    console.error(
      'Please manually remove it before running the installation script again.'
    );
    process.exit(1);
  }

  // Create the monodog directory
  fs.mkdirSync(monodogPath, { recursive: true });
  console.log(`Created directory: ${monodogPath}`);

  // Create package.json inside monodog
  const pkgJsonPath = path.join(monodogPath, 'package.json');
  const pkgJsonContent = {
    name: 'monodog-workspace',
    version: '1.0.0',
    private: true,
    scripts: {
      build: 'pnpm --dir monodog-dashboard run build',
      serve: 'pnpm exec monodog-cli --serve --root ..',
    },
  };
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJsonContent, null, 2));

  // Download and configure Dashboard
  console.log(`\nFetching @mindfiredigital/dashboard...`);
  try {
    // Run pnpm add inside the monodog directory to fetch the dashboard
    spawnSync(
      'pnpm',
      [
        'add',
        '@mindfiredigital/dashboard',
        '@mindfiredigital/monodog',
        '--ignore-workspace',
      ],
      { cwd: monodogPath, stdio: 'inherit', shell: true }
    );

    // Copy the dashboard from the isolated node_modules into monodog-dashboard
    const dashboardSource = path.join(
      monodogPath,
      'node_modules',
      '@mindfiredigital/dashboard'
    );
    const dashboardDest = path.join(monodogPath, 'monodog-dashboard');
    fs.cpSync(dashboardSource, dashboardDest, {
      recursive: true,
      dereference: true,
    });
    console.log(`Successfully installed dashboard at ${dashboardDest}`);
  } catch (err: unknown) {
    console.error(`Failed to install dashboard: ${err}`);
    process.exit(1);
  }

  // Copy Prisma files
  const prismaSource = path.join(__dirname, '..', 'prisma');
  const prismaDest = path.join(monodogPath, 'prisma');
  if (fs.existsSync(prismaSource)) {
    fs.cpSync(prismaSource, prismaDest, { recursive: true });
    console.log(`Copied prisma schema to ${prismaDest}`);
  } else {
    console.warn(`Warning: Prisma schema source not found at ${prismaSource}`);
  }

  // Generate Prisma & Migrate
  console.log(`\nInitializing Database...`);
  try {
    // Create the .env file so Prisma knows where the database is and GitHub Auth can be configured
    const envContent = `DATABASE_URL="file:./monodog.db"

# --- ACTION REQUIRED ---
# GitHub OAuth Configuration for Monodog Dashboard
# Get these from https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3010/auth/callback
CORS_ORIGINS=http://localhost:3010
`;
    fs.writeFileSync(path.join(monodogPath, '.env'), envContent);

    // Add prisma client so we can generate
    spawnSync(
      'pnpm',
      [
        'add',
        '-D',
        '@prisma/client@5.22.0',
        'prisma@5.22.0',
        '--ignore-workspace',
      ],
      { cwd: monodogPath, stdio: 'inherit', shell: true }
    );

    // Generate the client
    spawnSync(
      'pnpm',
      ['exec', 'prisma', 'generate', '--schema', './prisma/schema.prisma'],
      { cwd: monodogPath, stdio: 'inherit', shell: true }
    );

    // Migrate the DB
    spawnSync(
      'pnpm',
      [
        'exec',
        'prisma',
        'migrate',
        'dev',
        '--name',
        'init',
        '--schema',
        './prisma/schema.prisma',
      ],
      { cwd: monodogPath, stdio: 'inherit', shell: true }
    );
  } catch (err: unknown) {
    console.error(`Database initialization failed: ${err}`);
  }

  // Update pnpm-workspace.yaml
  const workspaceYamlPath = path.join(rootDir, 'pnpm-workspace.yaml');
  if (fs.existsSync(workspaceYamlPath)) {
    let yamlContent = fs.readFileSync(workspaceYamlPath, 'utf8');
    if (
      !yamlContent.includes("'monodog'") &&
      !yamlContent.includes('"monodog"')
    ) {
      yamlContent += `\n  - 'monodog'\n  - 'monodog/*'`;
      fs.writeFileSync(workspaceYamlPath, yamlContent);
      console.log(`\nAdded 'monodog' to pnpm-workspace.yaml`);
    }
  }

  // Generate config file
  createConfigFileIfMissing(monodogPath);

  console.log(`\n*** MONODOG INSTALLATION COMPLETE ***`);
  console.log(
    `1. Edit monodog/.env and add your GitHub OAuth credentials! (REQUIRED)`
  );
  console.log(
    `2. pnpm install    (Run this in your root folder to wire up the new workspaces!)`
  );
  console.log(`3. cd monodog`);
  console.log(`4. pnpm run build`);
  console.log(`5. pnpm run serve`);
};

const run = async () => {
  if (serve) {
    console.log(`Starting Monodog API server...`);
    console.log(`Analyzing monorepo at root: ${rootPath}`);
    // Lazy loaded imports!
    const { startServer, serveDashboard } = await import('./index.js');
    startServer(rootPath, port, host);
    serveDashboard(
      rootPath,
      appConfig.dashboard.port,
      appConfig.dashboard.host
    );
  } else if (init) {
    console.log(`\nInitializing Monodog Environment...`);
    initMonodogEnvironment(rootPath);
  } else {
    console.log(
      `Monodog CLI: No operation specified. Use --serve to start the API or -h for help.`
    );
  }
};

run().catch(e => {
  console.error('error:', e);
  process.exit(1);
});
