/**
 * GitService.ts
 *
 * This service executes native 'git' commands using Node.js's child_process
 * to retrieve the commit history of the local repository.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

// Promisify the standard 'exec' function for easy async/await usage
const execPromise = promisify(exec);

/**
 * Interface representing a single commit object with key metadata.
 */
interface GitCommit {
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
const VALID_COMMIT_TYPES: string[] = [
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

/**
 * The delimiter used to separate individual commit records in the git log output.
 * We use a unique string to ensure reliable splitting.
 */
const COMMIT_DELIMITER = '|---COMMIT-END---|';

/**
 * The custom format string passed to 'git log'.
 * It uses JSON structure and our unique delimiter to make parsing consistent.
 * * %H: Commit hash
 * %pn: packageName name
 * %ae: Author email
 * %ad: Author date (ISO 8601 format)
 * %s: Subject (commit message's first line - used for 'message' and 'type' fields)
 */
const GIT_LOG_FORMAT = `{"hash": "%H", "author": "%ae", "packageName": "%pn", "date": "%ad", "message": "%s", "type": "%s"}${COMMIT_DELIMITER}`;

export class GitService {
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    // Allows specifying a custom path to the monorepo root
    this.repoPath = repoPath;
  }

  /**
   * Retrieves commit history for the repository, optionally filtered by a package path.
   * @param pathFilter The path to a package directory (e.g., 'packages/server').
   * If provided, only commits affecting that path are returned.
   * @returns A Promise resolving to an array of GitCommit objects.
   */
  public async getAllCommits(pathFilter?: string): Promise<GitCommit[]> {
    const pathArgument = pathFilter ? ` -- ${pathFilter}` : '';

    const command = `git log --pretty=format:'${GIT_LOG_FORMAT}' --date=iso-strict${pathArgument}`;

    try {
      console.log(`Executing Git command: ${command}`);
      const { stdout } = await execPromise(command, {
        cwd: this.repoPath,
        maxBuffer: 1024 * 5000,
      }); // Increase buffer for large repos
      // console.log(stdout)
      console.log(stdout, '--', this.repoPath);
      const escapedDelimiter = COMMIT_DELIMITER.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      // 1. Remove the final trailing delimiter, as it creates an empty string at the end of the array
      const cleanedOutput = stdout
        .trim()
        .replace(new RegExp(`${escapedDelimiter}$`), '');
      console.log(cleanedOutput);

      if (!cleanedOutput) {
        return [];
      }
      // 2. Split the output by our custom delimiter to get an array of JSON strings
      const jsonStrings = cleanedOutput.split(COMMIT_DELIMITER);
      // 3. Parse each string into a GitCommit object
      const commits: GitCommit[] = jsonStrings
        .map(jsonString => {
          try {
            // JSON.parse is necessary because the output starts as a string
            const commit = JSON.parse(jsonString);
            console.log(commit.type, commit['hash']);
            try {
              // FIX: Updated Regex to handle optional scope (e.g., 'feat(scope):')
              // Matches:
              // 1. (^(\w+)) - The commit type (e.g., 'feat')
              // 2. (\([^)]+\))? - The optional scope (e.g., '(setup)')
              // 3. (:|!) - Ends with a colon or an exclamation point (for breaking changes)
              const typeMatch = commit.type.match(/^(\w+)(\([^)]+\))?([:!])/);
              let extractedType = 'other';
              if (typeMatch) {
                const rawType = typeMatch[1];
                // NEW: Validate the extracted type against the list of known types
                if (VALID_COMMIT_TYPES.includes(rawType)) {
                  extractedType = rawType;
                }
              }
              commit.type = extractedType;
            } catch (e) {
              console.error('Failed to match commit type:', commit, e);
              // Skip malformed entries
              return null;
            }
            // // Set type to 'other' if the conventional format is not found
            // commit.type = typeMatch ? typeMatch[1] : 'other';
            return commit;
          } catch (e) {
            // console.log(jsonString)
            console.error('Failed to parse commit JSON:', jsonString, e);
            // Skip malformed entries
            return null;
          }
        })
        .filter((commit): commit is GitCommit => commit !== null);

      return commits;
    } catch (error) {
      console.error('Error fetching Git history:', error);
      // In a real application, you would handle this gracefully (e.g., throwing a custom error)
      throw new Error(
        'Failed to retrieve Git commit history. Is Git installed and is the path correct?'
      );
    }
  }
}
