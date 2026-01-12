/**
 * Git-related types
 */

/**
 * Interface representing a single commit object with key metadata.
 */
export interface GitCommit {
  hash: string;
  author: string;
  packageName: string;
  date: Date;
  message: string;
  type: string;
}

/**
 * List of standard Conventional Commit types for validation.
 * Any extracted type not in this list will be set to 'other'.
 */
export const VALID_COMMIT_TYPES: string[] = [
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
