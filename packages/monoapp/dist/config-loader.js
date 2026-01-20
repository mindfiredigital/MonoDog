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
exports.appConfig = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("./middleware/logger");
// Global variable to hold the loaded config
let config = null;
/**
 * Loads the monodog-config.json file from the monorepo root.
 * This should be called only once during application startup.
 * @returns The application configuration object.
 */
function loadConfig() {
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
        logger_1.AppLogger.error(`Configuration file not found at ${configPath}`);
        process.exit(1);
    }
    try {
        // 2. Read and parse the JSON file
        const fileContent = fs.readFileSync(configPath, 'utf-8');
        const parsedConfig = JSON.parse(fileContent);
        // Cache and return
        config = parsedConfig;
        return config;
    }
    catch (error) {
        logger_1.AppLogger.error('Failed to read or parse monodog-config.json.', error);
        process.exit(1);
    }
}
function createConfigFileIfMissing(rootPath) {
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
    logger_1.AppLogger.info(`\n[monodog] Checking for ${configFileName}...`);
    if (fs.existsSync(configFilePath)) {
        logger_1.AppLogger.info(`\n[monodog] ${configFileName} already exists at ${configFilePath}. Skipping creation.`);
    }
    else {
        try {
            // Write the default content to the file
            fs.writeFileSync(configFilePath, contentString, 'utf-8');
            logger_1.AppLogger.info(`[monodog] Successfully generated default ${configFileName} in the workspace root.`);
            process.stderr.write('[monodog] Please review and update settings like "host" and "port".');
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logger_1.AppLogger.error(`Failed to generate ${configFileName}: ${message}`);
            process.exit(1);
        }
    }
}
const appConfig = loadConfig();
exports.appConfig = appConfig;
