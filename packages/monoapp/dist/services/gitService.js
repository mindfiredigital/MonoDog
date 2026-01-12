"use strict";
/**
 * GitService.ts
 *
 * This service executes native 'git' commands using Node.js's child_process
 * to retrieve the commit history of the local repository.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitService = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
// Promisify the standard 'exec' function for easy async/await usage
const execPromise = (0, util_1.promisify)(child_process_1.exec);
/**
 * List of standard Conventional Commit types for validation.
 * Any extracted type not in this list will be set to 'other'.
 */
const VALID_COMMIT_TYPES = [
    'feat', // New feature
    'fix', // Bug fix
    'docs', // Documentation changes
    'style', // Code style changes (formatting, etc)
    'refactor', // Code refactoring
    'perf', // Performance improvements
    'test', // Adding or updating tests
    'chore', // Maintenance tasks (e.g., build scripts, dependency updates)
    'ci', // CI/CD changes
    'build', // Build system changes (e.g., pnpm/npm scripts)
    'revert', // Reverting changes
];
class GitService {
    constructor(repoPath = process.cwd()) {
        this.repoPath = repoPath;
    }
    /**
     * Retrieves commit history for the repository, optionally filtered by a package path.
     */
    async getAllCommits(pathFilter) {
        try {
            let pathArgument = '';
            if (pathFilter) {
                // Normalize the path and ensure it's relative to the repo root
                const normalizedPath = this.normalizePath(pathFilter);
                if (normalizedPath) {
                    pathArgument = ` -C ${normalizedPath}`;
                }
            }
            // First, validate we're in a git repo
            await this.validateGitRepository(pathArgument);
            console.log(`Executing Git command in: ${this.repoPath}`);
            // Use a simpler git log format
            const command = `git log --pretty=format:"%H|%an|%ad|%s" --date=iso-strict ${pathArgument}`;
            console.log(`Git command: ${command}`);
            const { stdout, stderr } = await execPromise(command, {
                cwd: this.repoPath,
                maxBuffer: 1024 * 5000,
            });
            if (stderr) {
                console.warn('Git stderr:', stderr);
            }
            if (!stdout.trim()) {
                console.log('📭 No commits found for path:', pathFilter);
                return [];
            }
            // Parse the output
            const commits = [];
            const lines = stdout.trim().split('\n');
            for (const line of lines) {
                try {
                    const [hash, author, date, message] = line.split('|');
                    const commit = {
                        hash: hash.trim(),
                        author: author.trim(),
                        packageName: pathFilter || 'root',
                        date: new Date(date.trim()),
                        message: message.trim(),
                        type: this.extractCommitType(message.trim()),
                    };
                    commits.push(commit);
                }
                catch (parseError) {
                    console.error('Failed to parse commit line:', line, parseError);
                }
            }
            console.log(`Successfully parsed ${commits.length} commits`);
            return commits;
        }
        catch (error) {
            console.error('Error in getAllCommits:', error);
            throw error;
        }
    }
    /**
     * Normalize path to be relative to git repo root
     */
    normalizePath(inputPath) {
        // If it's an absolute path, make it relative to repo root
        if (path_1.default.isAbsolute(inputPath)) {
            return path_1.default.relative(this.repoPath, inputPath);
        }
        // If it's already relative, return as-is
        return inputPath;
    }
    /**
     * Extract commit type from message
     */
    extractCommitType(message) {
        try {
            const typeMatch = message.match(/^(\w+)(\([^)]+\))?!?:/);
            if (typeMatch) {
                const rawType = typeMatch[1].toLowerCase();
                if (VALID_COMMIT_TYPES.includes(rawType)) {
                    return rawType;
                }
            }
            return 'other';
        }
        catch (error) {
            return 'other';
        }
    }
    /**
     * Validate that we're in a git repository
     */
    async validateGitRepository(pathArgument) {
        try {
            await execPromise('git ' + pathArgument + ' rev-parse --is-inside-work-tree', {
                cwd: this.repoPath,
            });
            console.log('Valid git repository');
        }
        catch (error) {
            throw new Error('Not a git repository (or any of the parent directories)');
        }
    }
}
exports.GitService = GitService;
