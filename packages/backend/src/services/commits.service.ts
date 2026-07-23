import fs from 'fs';
import path from 'path';
import { GitService } from '../gitService';

export const getPackageCommits = async (
  packagePath: string,
  rootPath?: string
) => {
  const decodedPath = decodeURIComponent(packagePath);

  const projectRoot = rootPath || process.cwd();

  const gitService = new GitService(projectRoot);

  let relativePath = decodedPath;

  if (path.isAbsolute(decodedPath)) {
    relativePath = path.relative(projectRoot, decodedPath);
  }

  try {
    await fs.promises.access(relativePath);
  } catch {
    try {
      await fs.promises.access(decodedPath);
      relativePath = decodedPath;
    } catch {
      throw new Error(
        `Package path not found: ${relativePath} (also tried: ${decodedPath})`
      );
    }
  }

  const commits = await gitService.getAllCommits(relativePath);

  return commits;
};
