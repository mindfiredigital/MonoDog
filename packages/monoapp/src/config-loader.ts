import * as fs from 'fs';
import * as path from 'path';

// Define a type/interface for your configuration structure
interface MonodogConfig {
  workspace: {
    root_dir: string;
    install_path: string;
  };
  database: {
    type: 'postgres' | 'mysql' | 'sqlite';
    host: string;
    port: number;
    user: string;
    path: string; // Used for SQLite path or general data storage path
  };
  dashboard: {
    host: string;
    port: number;
  };
  server: {
    host: string;
    port: number;
  };
}

// Global variable to hold the loaded config
let config: MonodogConfig | null = null;

/**
 * Loads the monodog-conf.json file from the monorepo root.
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
    const rootPath = path.resolve(process.cwd()); // Adjust based on your workspace folder depth  from root if needed
    const configPath = path.resolve(rootPath, 'monodog-conf.json');
      createConfigFileIfMissing(rootPath);

    if (!fs.existsSync(configPath)) {
        console.error(`ERROR1: Configuration file not found at ${configPath}`);
            process.exit(1);
    }

  try {
    // 2. Read and parse the JSON file
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    const parsedConfig = JSON.parse(fileContent) as MonodogConfig;

    // 3. Optional: Add validation logic here (e.g., check if ports are numbers)

    // Cache and return
    config = parsedConfig;
    process.stderr.write('[Config] Loaded configuration from: ...\n');
    return config;

  } catch (error) {
    console.error("ERROR: Failed to read or parse monodog-conf.json.");
    console.error(error);
    process.exit(1);
  }
}


function createConfigFileIfMissing(rootPath: string): void {
// --- CONFIGURATION ---
const configFileName = 'monodog-conf.json';
const configFilePath = path.resolve(rootPath, configFileName);

// The default content for the configuration file
const defaultContent = {
  "workspace": {
    "root_dir": "./",  // Relative to where the config file is located
    "install_path":"packages" // Where to install monodog packages
  },
  "database": {
    "path": "file:./monodog.db" // SQLite database file path, relative to prisma schema location
  },
  "dashboard": {
    "host": "0.0.0.0",
    "port": "3010"
  },
  "server": {
    "host": "0.0.0.0", // Default host for the API server
    "port": 8999 // Default port for the API server
  }
};

const contentString = JSON.stringify(defaultContent, null, 2);
// ---------------------

process.stderr.write(`\n[monodog] Checking for ${configFileName}...`);

if (fs.existsSync(configFilePath)) {
  process.stderr.write(`[monodog] ${configFileName} already exists at ${configFilePath}. Skipping creation.`);
} else {
  try {
    // Write the default content to the file
    fs.writeFileSync(configFilePath, contentString, 'utf-8');
   process.stderr.write(`[monodog] Successfully generated default ${configFileName} in the workspace root.`);
   process.stderr.write('[monodog] Please review and update settings like "host" and "port".');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[monodog Error] Failed to generate ${configFileName}:`, message);
    process.exit(1);
  }
}
}
const appConfig = loadConfig();
export { appConfig };
// --- Example Usage ---

// In your main application file (e.g., packages/backend/src/index.ts):
/*

import { appConfig } from './config-loader';

// Load configuration on startup
// const appConfig = loadConfig();

// Access the variables easily
const dbHost = appConfig.database.host;
const serverPort = appConfig.server.port;
const workspaceRoot = appConfig.workspace.root_dir;

console.log(`\nStarting server on port: ${serverPort}`);
console.log(`Database connecting to host: ${dbHost}`);

// Example server start logic
// app.listen(serverPort, appConfig.server.host, () => {
//   console.log(`Server running at http://${appConfig.server.host}:${serverPort}`);
// });
*/
