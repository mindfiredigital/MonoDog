import { GitService } from '../gitService';
import path from 'path';
import fs from 'fs';

export const getCommitsByPathService = async (packagePath: string) => {

  // Decode the package path
  const decodedPath = decodeURIComponent(packagePath);

  console.log('🔍 Fetching commits for path:', decodedPath);
  console.log('📁 Current working directory:', process.cwd());

  const gitService = new GitService();

  // Check if this is an absolute path and convert to relative if needed
  let relativePath = decodedPath;
  const projectRoot = process.cwd();

  // If it's an absolute path, make it relative to project root
  if (path.isAbsolute(decodedPath)) {
    relativePath = path.relative(projectRoot, decodedPath);
    console.log('🔄 Converted absolute path to relative:', relativePath);
  }

  // Check if the path exists
  try {
    await fs.promises.access(relativePath);
    console.log('✅ Path exists:', relativePath);
  } catch (fsError) {
    console.log('❌ Path does not exist:', relativePath);
    // Try the original path as well
    try {
      await fs.promises.access(decodedPath);
      console.log('✅ Original path exists:', decodedPath);
      relativePath = decodedPath; // Use original path if it exists
    } catch (secondError) {
      throw new Error(`Path does not exist: ${decodedPath}`);
    }
  }

  const commits = await gitService.getAllCommits(relativePath);

  return commits;
}
