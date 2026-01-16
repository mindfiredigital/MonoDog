import * as fs from 'fs';
import * as path from 'path';

import type { MonodogConfig } from './types';

// Global variable to hold the loaded config
let config: MonodogConfig | null = null;

/**
 * Loads the monodog-config.json file from the monorepo root.
 * This should be called only once during application startup.
 * @returns The application configuration object.
 */
function loadConfig(): MonodogConfig {
  if (config) {
    return config; // Return cached config if already loaded
  }

  // 1. Determine the path to the config file
  // We assume the backend package is running from the monorepo root (cwd is root)
  // or that we can navigate up to the root from the current file's location.
  const rootPath = path.resolve(process.cwd());
  const configPath = path.resolve(rootPath, 'monodog-config.json');
  createConfigFileIfMissing(rootPath);

  if (!fs.existsSync(configPath)) {
    console.error(`ERROR1: Configuration file not found at ${configPath}`);
    process.exit(1);
  }

  try {
    // 2. Read and parse the JSON file
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    const parsedConfig = JSON.parse(fileContent) as MonodogConfig;

    // Cache and return
    config = parsedConfig;
    process.stderr.write('[Config] Loaded configuration from: ...\n');
    return config;
  } catch (error) {
    console.error('ERROR: Failed to read or parse monodog-config.json.');
    console.error(error);
    process.exit(1);
  }
}

function createConfigFileIfMissing(rootPath: string): void {
  // --- CONFIGURATION ---
  const configFileName = 'monodog-config.json';
  const configFilePath = path.resolve(rootPath, configFileName);

  // The default content for the configuration file
  const defaultContent = {
    workspaces: [],
    database: {
      path: 'file:./monodog.db', // SQLite database file path, relative to prisma schema location
    },
    dashboard: {
      host: 'localhost',
      port: '3010',
    },
    server: {
      host: 'localhost', // Default host for the API server
      port: 8999, // Default port for the API server
    },
  };

  const contentString = JSON.stringify(defaultContent, null, 2);
  // ---------------------

  process.stderr.write(`\n[monodog] Checking for ${configFileName}...`);

  if (fs.existsSync(configFilePath)) {
    process.stderr.write(
      `[monodog] ${configFileName} already exists at ${configFilePath}. Skipping creation.`
    );
  } else {
    try {
      // Write the default content to the file
      fs.writeFileSync(configFilePath, contentString, 'utf-8');
      process.stderr.write(
        `[monodog] Successfully generated default ${configFileName} in the workspace root.`
      );
      process.stderr.write(
        '[monodog] Please review and update settings like "host" and "port".'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[monodog Error] Failed to generate ${configFileName}:`,
        message
      );
      process.exit(1);
    }
  }
}
const appConfig = loadConfig();
export { appConfig };

