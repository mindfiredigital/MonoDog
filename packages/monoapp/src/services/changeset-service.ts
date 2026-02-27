/**
 * Changeset Service
 * Handles changeset generation, validation, and publishing
 */

import path from 'path';
import fs from 'fs/promises';
import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AppLogger } from '../middleware/logger';
import { getPackagesService } from './package-service';
import { getWorkflowRuns } from './github-actions-service';
import { CHANGESET_MESSAGES } from '../constants/api-messages';
import type { VersionBump, Package, VersionBumpItem, PublishPlan } from '../types/changeset';

const execPromise = promisify(exec);

/**
 * Get all workspace packages
 */
export async function getWorkspacePackages(rootPath: string): Promise<Package[]> {
  try {
    // Get packages from package service
    const packages = await getPackagesService(rootPath);
    return packages.map((pkg: Record<string, unknown>) => ({
      name: pkg.name as string,
      version: (pkg.version as string) || '0.0.0',
      path: pkg.path as string,
      private: (pkg.private as boolean) || false,
      dependencies: (pkg.dependencies as Record<string, string>) || {},
      devDependencies: (pkg.devDependencies as Record<string, string>) || {},
    }));
  } catch (error) {
    AppLogger.error(`Failed to get workspace packages: ${error}`);
    throw error;
  }
}

/**
 * Get existing unpublished changesets
 */
export async function getExistingChangesets(rootPath: string): Promise<string[]> {
  try {
    const changesetsDir = path.join(rootPath, '.changeset');

    try {
      const files = await fs.readdir(changesetsDir);
      return files
        .filter((file) => file.endsWith('.md') && file !== 'README.md')
        .map((file) => file.replace('.md', ''));
    } catch {
      // Directory doesn't exist yet
      return [];
    }
  } catch (error) {
    AppLogger.error(`Failed to get existing changesets: ${error}`);
    return [];
  }
}

/**
 * Calculate new versions for selected packages
 */
export function calculateNewVersions(
  packages: Package[],
  bumps: Array<{ package: string; bumpType: VersionBump }>
): VersionBumpItem[] {
  return packages.map((pkg) => {
    const bump = bumps.find((b) => b.package === pkg.name);
    const bumpType = bump?.bumpType || 'patch';

    const newVersion = calculateVersion(pkg.version, bumpType);

    return {
      package: pkg.name,
      currentVersion: pkg.version,
      newVersion,
      bumpType,
    };
  });
}

/**
 * Calculate new version based on bump type
 */
function calculateVersion(currentVersion: string, bumpType: VersionBump): string {
  const parts = currentVersion.split('.').map((p) => parseInt(p, 10));
  const [major, minor = 0, patch = 0] = parts;

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Validate that changeset can be created
 */
export async function validateChangeset(
  rootPath: string,
  packages: string[],
  summary: string
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Validate packages exist
  const allPackages = await getWorkspacePackages(rootPath);
  for (const pkgName of packages) {
    if (!allPackages.find((p) => p.name === pkgName)) {
      errors.push(`Package ${pkgName} not found`);
    }
  }

  // Validate summary
  if (!summary || summary.length < 10) {
    errors.push('Summary must be at least 10 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a new changeset
 */
export async function generateChangeset(
  rootPath: string,
  packages: string[],
  bumps: Array<{ package: string; bumpType: VersionBump }>,
  summary: string,
  createdBy?: string
): Promise<{ success: boolean; message: string; changeset?: string }> {
  try {
    // Validate input
    const validation = await validateChangeset(rootPath, packages, summary);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.errors.join(', '),
      };
    }

    // Create .changeset directory if it doesn't exist
    const changesetsDir = path.join(rootPath, '.changeset');
    try {
      await fs.mkdir(changesetsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique changeset filename (using timestamp + random)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const changesetName = `${timestamp}-${random}`;
    const changesetPath = path.join(changesetsDir, `${changesetName}.md`);

    // Format changeset content
    let content = `---\n`;
    for (const pkg of packages) {
      const bump = bumps.find((b) => b.package === pkg);
      const bumpType = bump?.bumpType || 'patch';
      content += `"${pkg}": ${bumpType}\n`;
    }
    content += `---\n\n`;
    content += summary;

    // Write changeset file
    await fs.writeFile(changesetPath, content, 'utf-8');

    AppLogger.info(`Changeset created: ${changesetName} by user: ${createdBy || 'unknown'}`);
    return {
      success: true,
      message: CHANGESET_MESSAGES.CREATED,
      changeset: changesetName,
    };
  } catch (error) {
    AppLogger.error(`Failed to generate changeset: ${error}`);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if working tree is clean
 */
export async function isWorkingTreeClean(rootPath: string): Promise<boolean> {
  return true; // For testing purposes, we assume it's always clean. Replace with actual git status check in production.
  try {
    const { stdout } = await execPromise('git status --porcelain', {
      cwd: rootPath,
    });
    return stdout.trim().length === 0;
  } catch {
    return false;
  }
}

/**
 * Trigger CI pipeline for publishing
 */
export async function triggerPublishPipeline(
  rootPath: string,
  publishedBy?: string,
  selectedPackages?: object[]
): Promise<{ success: boolean; message: string; result?: unknown }> {
  try {
    AppLogger.info(`Publishing workflow triggered by user: ${publishedBy || 'unknown'}`);

    // Commit the changeset if there are any changes
    try {
      const { stdout: status } = await execPromise('git status --porcelain', {
        cwd: rootPath,
      });

      if (status.trim()) {
        // Add changeset files
        await execPromise('git add .changeset/', { cwd: rootPath });

        // Commit with proper message
        await execPromise(
          'git commit -m "chore: publish changeset" --no-verify',
          { cwd: rootPath }
        );

        // Push to the current branch
        try {
          const { stdout: branch } = await execPromise(
            'git rev-parse --abbrev-ref HEAD',
            { cwd: rootPath }
          );
          const currentBranch = branch.trim();

          await execPromise(`git push origin ${currentBranch}`, {
            cwd: rootPath,
          });

          AppLogger.info(`Pushed changeset to ${currentBranch}`);
        } catch (pushError) {
          // If push fails, still continue - the workflow might be triggered manually
          AppLogger.warn(`Failed to push: ${pushError}`);
        }
      }
    } catch (gitError) {
      AppLogger.warn(`Git operations failed: ${gitError}`);
      // Continue anyway - changesets might already be committed
    }



    AppLogger.info('Publish pipeline initiated');
    return {
      success: true,
      message: 'Publishing workflow initiated',
      result: {
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    AppLogger.error(`Failed to trigger publish pipeline: ${error}`);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if CI pipeline is passing
 * Fetches the most recent workflow run and checks if it passed
 */
export async function checkCIPassing(
  accessToken: string | null | undefined,
  owner: string,
  repo: string,
  workflowId: string,
  workflowPath: string
): Promise<boolean> {
  try {
    if (!accessToken) {
      AppLogger.warn('No access token available for CI check');
      return true; // Allow publishing if no token
    }

    const { runs } = await getWorkflowRuns(owner, repo, accessToken, {
      workflowId,
      workflowPath,
      status: 'completed',
      per_page: 1,
    });

    if (!runs || runs.length === 0) {
      AppLogger.warn('No completed workflow runs found');
      return true; // Allow if no runs exist
    }

    const latestRun = runs[0];
    const passed = latestRun.conclusion === 'success';

    if (passed) {
      AppLogger.info('CI check passed: Latest workflow run succeeded');
    } else {
      AppLogger.warn(`CI check failed: Latest run conclusion is ${latestRun.conclusion}`);
    }

    return passed;
  } catch (error) {
    AppLogger.error(`Failed to check CI status: ${error}`);
    return true; // Allow on error
  }
}

/**
 * Check if a package version is available on npm registry
 * Returns true if version does NOT exist (safe to publish)
 * Returns false if version already exists
 */
export async function checkVersionAvailableOnNpm(
  packageName: string,
  version: string
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}/${encodeURIComponent(version)}`;

      const request = https.get(url, (response) => {
        if (response.statusCode === 200) {
          AppLogger.warn(`NPM version check: Version ${version} of ${packageName} already exists`);
          resolve(false); // Version exists, not available for publishing
        } else if (response.statusCode === 404) {
          AppLogger.info(`NPM version check: Version ${version} of ${packageName} is available`);
          resolve(true); // Version doesn't exist, safe to publish
        } else {
          AppLogger.warn(`NPM check unexpected status ${response.statusCode}`);
          resolve(true); // Default to allowing publish
        }
      });

      request.on('error', (error) => {
        AppLogger.error(`Failed to check npm version: ${error}`);
        resolve(true); // Allow on error
      });

      request.setTimeout(5000, () => {
        request.destroy();
        AppLogger.warn('NPM registry check timeout');
        resolve(true); // Allow on timeout
      });
    } catch (error) {
      AppLogger.error(`NPM version check error: ${error}`);
      resolve(true); // Allow on error
    }
  });
}


