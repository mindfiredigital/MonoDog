"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitsByPathService = void 0;
const gitService_1 = require("../gitService");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getCommitsByPathService = async (packagePath) => {
    // Decode the package path
    const decodedPath = decodeURIComponent(packagePath);
    console.log('🔍 Fetching commits for path:', decodedPath);
    console.log('📁 Current working directory:', process.cwd());
    const gitService = new gitService_1.GitService();
    // Check if this is an absolute path and convert to relative if needed
    let relativePath = decodedPath;
    const projectRoot = process.cwd();
    // If it's an absolute path, make it relative to project root
    if (path_1.default.isAbsolute(decodedPath)) {
        relativePath = path_1.default.relative(projectRoot, decodedPath);
        console.log('🔄 Converted absolute path to relative:', relativePath);
    }
    // Check if the path exists
    try {
        await fs_1.default.promises.access(relativePath);
        console.log('✅ Path exists:', relativePath);
    }
    catch (fsError) {
        console.log('❌ Path does not exist:', relativePath);
        // Try the original path as well
        try {
            await fs_1.default.promises.access(decodedPath);
            console.log('✅ Original path exists:', decodedPath);
            relativePath = decodedPath; // Use original path if it exists
        }
        catch (secondError) {
            throw new Error(`Path does not exist: ${decodedPath}`);
        }
    }
    const commits = await gitService.getAllCommits(relativePath);
    return commits;
};
exports.getCommitsByPathService = getCommitsByPathService;
