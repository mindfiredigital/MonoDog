import { GitService } from './git-service';
import path from 'path';
import fs from 'fs';
import { AppLogger } from '../middleware/logger';

export const getCommitsByPathService = async (packagePath: string) => {

  // Decode the package path
  const decodedPath = decodeURIComponent(packagePath);

  AppLogger.debug('Fetching commits for path: ' + decodedPath);
  AppLogger.debug('Current working directory: ' + process.cwd());

  const gitService = new GitService();

  // Check if this is an absolute path and convert to relative if needed
  let relativePath = decodedPath;
  const projectRoot = process.cwd();

  // If it's an absolute path, make it relative to project root
  if (path.isAbsolute(decodedPath)) {
    relativePath = path.relative(projectRoot, decodedPath);
    AppLogger.debug('Converted absolute path to relative: ' + relativePath);
  }

  // Check if the path exists
  try {
    await fs.promises.access(relativePath);
    AppLogger.debug('Path exists: ' + relativePath);
  } catch (fsError) {
    // Try the original path as well
    try {
      await fs.promises.access(decodedPath);
      AppLogger.debug('Original Commit path exists: ' + decodedPath);
      relativePath = decodedPath; // Use original path if it exists
    } catch (secondError) {
      throw new Error(`Commit Path does not exist: ${decodedPath}`);
    }
  }

  const commits = await gitService.getAllCommits(relativePath);

  return commits;
}
