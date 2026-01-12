/**
 * GitService.ts
 *
 * This service executes native 'git' commands using Node.js's child_process
 * to retrieve the commit history of the local repository.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

import type { GitCommit } from '../types';
import { VALID_COMMIT_TYPES } from '../types';

// Promisify the standard 'exec' function for easy async/await usage
const execPromise = promisify(exec);

export class GitService {
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
  }

  /**
   * Retrieves commit history for the repository, optionally filtered by a package path.
   */
  public async getAllCommits(pathFilter?: string): Promise<GitCommit[]> {
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
      const commits: GitCommit[] = [];
      const lines = stdout.trim().split('\n');

      for (const line of lines) {
        try {
          const [hash, author, date, message] = line.split('|');

          const commit: GitCommit = {
            hash: hash.trim(),
            author: author.trim(),
            packageName: pathFilter || 'root',
            date: new Date(date.trim()),
            message: message.trim(),
            type: this.extractCommitType(message.trim()),
          };

          commits.push(commit);
        } catch (parseError) {
          console.error('Failed to parse commit line:', line, parseError);
        }
      }

      console.log(`Successfully parsed ${commits.length} commits`);
      return commits;
    } catch (error) {
      console.error('Error in getAllCommits:', error);
      throw error;
    }
  }

  /**
   * Normalize path to be relative to git repo root
   */
  private normalizePath(inputPath: string): string {
    // If it's an absolute path, make it relative to repo root
    if (path.isAbsolute(inputPath)) {
      return path.relative(this.repoPath, inputPath);
    }

    // If it's already relative, return as-is
    return inputPath;
  }

  /**
   * Extract commit type from message
   */
  private extractCommitType(message: string): string {
    try {
      const typeMatch = message.match(/^(\w+)(\([^)]+\))?!?:/);
      if (typeMatch) {
        const rawType = typeMatch[1].toLowerCase();
        if (VALID_COMMIT_TYPES.includes(rawType)) {
          return rawType;
        }
      }
      return 'other';
    } catch (error) {
      return 'other';
    }
  }

  /**
   * Validate that we're in a git repository
   */
  private async validateGitRepository(pathArgument: string): Promise<void> {
    try {
      await execPromise('git '+pathArgument+' rev-parse --is-inside-work-tree', {
        cwd: this.repoPath,
      });
      console.log('Valid git repository');
    } catch (error) {
      throw new Error(
        'Not a git repository (or any of the parent directories)'
      );
    }
  }
}
