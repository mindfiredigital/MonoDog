"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitsByPathService = void 0;
const git_service_1 = require("./git-service");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../middleware/logger");
const getCommitsByPathService = async (packagePath) => {
    // Decode the package path
    const decodedPath = decodeURIComponent(packagePath);
    logger_1.AppLogger.debug('Fetching commits for path: ' + decodedPath);
    logger_1.AppLogger.debug('Current working directory: ' + process.cwd());
    const gitService = new git_service_1.GitService();
    // Check if this is an absolute path and convert to relative if needed
    let relativePath = decodedPath;
    const projectRoot = process.cwd();
    // If it's an absolute path, make it relative to project root
    if (path_1.default.isAbsolute(decodedPath)) {
        relativePath = path_1.default.relative(projectRoot, decodedPath);
        logger_1.AppLogger.debug('Converted absolute path to relative: ' + relativePath);
    }
    // Check if the path exists
    try {
        await fs_1.default.promises.access(relativePath);
        logger_1.AppLogger.debug('Path exists: ' + relativePath);
    }
    catch (fsError) {
        // Try the original path as well
        try {
            await fs_1.default.promises.access(decodedPath);
            logger_1.AppLogger.debug('Original Commit path exists: ' + decodedPath);
            relativePath = decodedPath; // Use original path if it exists
        }
        catch (secondError) {
            throw new Error(`Commit Path does not exist: ${decodedPath}`);
        }
    }
    const commits = await gitService.getAllCommits(relativePath);
    return commits;
};
exports.getCommitsByPathService = getCommitsByPathService;
