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
  monodog [options]

Options:
  --root <path>      Specify the root directory of the monorepo to analyze (default: current working directory).
  --port <number>    Specify the port for the API server (default: 4000).
  -h, --help         Show this help message.

Examples:
  npx @mindfiredigital/monodog                                (One-shot execution via npx)
  pnpm dlx @mindfiredigital/monodog                           (One-shot execution via pnpm)
  monodog --root /path/to/my/monorepo                         (If installed globally or via package scripts)
  monodog --port 4005                                         (Specify custom API port)
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
      root_dir: './',
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
        `[monodog] Successfully generated default ${configFileName} in ${rootPath}.`
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
  // Generate config file in workspace root
  createConfigFileIfMissing(rootDir);

  // Default configuration keys to ensure exist in .env
  const defaultEnvEntries: Record<string, string> = {
    DATABASE_URL: '"file:./monodog.db"',
    GITHUB_CLIENT_ID: 'your_github_client_id_here',
    GITHUB_CLIENT_SECRET: 'your_github_client_secret_here',
    GITHUB_REDIRECT_URI: 'http://localhost:3010/auth/callback',
    CORS_ORIGINS: 'http://localhost:3010',
  };

  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) {
    let newEnvContent = '# --- MonoDog Configuration ---\n';
    for (const [key, val] of Object.entries(defaultEnvEntries)) {
      newEnvContent += `${key}=${val}\n`;
    }
    fs.writeFileSync(envPath, newEnvContent);
    console.log(`[monodog] Successfully generated .env file in ${rootDir}.`);
  } else {
    const existingEnv = fs.readFileSync(envPath, 'utf8');
    let toAppend = '';

    for (const [key, val] of Object.entries(defaultEnvEntries)) {
      // Check if key exists as a line in .env (e.g. KEY=)
      const keyRegex = new RegExp(`^\\s*${key}\\s*=`, 'm');
      if (!keyRegex.test(existingEnv)) {
        toAppend += `${key}=${val}\n`;
      }
    }

    if (toAppend) {
      fs.appendFileSync(
        envPath,
        `\n# --- MonoDog Configuration ---\n${toAppend}`
      );
      console.log(
        `[monodog] Appended missing MonoDog configuration variables to existing .env in ${rootDir}.`
      );
    }
  }
};

const run = async () => {
  // Auto-initialize config and .env if missing
  initMonodogEnvironment(rootPath);

  console.log(`Starting Monodog API server...`);
  console.log(`Analyzing monorepo at root: ${rootPath}`);

  // Lazy loaded imports!
  const { startServer, serveDashboard } = await import('./index.js');
  startServer(rootPath, port, host);
  serveDashboard(rootPath, appConfig.dashboard.port, appConfig.dashboard.host);
};

run().catch(e => {
  console.error('error:', e);
  process.exit(1);
});
