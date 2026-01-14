"use strict";
/**
 * Git-related types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_COMMIT_TYPES = void 0;
/**
 * Interface representing a single commit object with key metadata.
 */
// export interface GitCommit {
//   hash: string;
//   author: string;
//   packageName: string;
//   date: Date;
//   message: string;
//   type: string;
// }
/**
 * List of standard Conventional Commit types for validation.
 * Any extracted type not in this list will be set to 'other'.
 */
exports.VALID_COMMIT_TYPES = [
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
