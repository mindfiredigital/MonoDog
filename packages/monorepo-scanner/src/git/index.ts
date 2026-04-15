import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PackageReport } from '../types';

export function getLastModified(packagePath: string): Date {
  try {
    const stats = fs.statSync(packagePath);
    return stats.mtime;
  } catch (error) {
    return new Date();
  }
}

export async function getGitInfo(
  packagePath: string
): Promise<PackageReport['gitInfo'] | undefined> {
  try {
    const gitPath = path.join(packagePath, '.git');
    if (!fs.existsSync(gitPath)) {
      return undefined;
    }

    const lastCommit = execSync('git rev-parse HEAD', {
      cwd: packagePath,
      stdio: 'pipe',
    })
      .toString()
      .trim();

    const lastCommitDate = new Date(
      execSync('git log -1 --format=%cd', {
        cwd: packagePath,
        stdio: 'pipe',
      })
        .toString()
        .trim()
    );

    const author = execSync('git log -1 --format=%an', {
      cwd: packagePath,
      stdio: 'pipe',
    })
      .toString()
      .trim();

    const branch = execSync('git branch --show-current', {
      cwd: packagePath,
      stdio: 'pipe',
    })
      .toString()
      .trim();

    return {
      lastCommit: lastCommit.substring(0, 7),
      lastCommitDate,
      author,
      branch,
    };
  } catch (error) {
    return undefined;
  }
}
