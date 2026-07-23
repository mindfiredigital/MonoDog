import { prisma } from '../db/prisma';
import {
  scanMonorepo,
  checkOutdatedDependencies,
} from '@mindfiredigital/utils/helpers';
import path from 'path';

let syncInterval: NodeJS.Timeout | null = null;
let isSyncing = false;

/**
 * Background worker that polls NPM registry for outdated dependencies.
 * Caches results in the SQLite database to avoid slow frontend loads.
 */
export async function runNpmSync(rootPath: string) {
  if (isSyncing) {
    console.log('[NPM Sync] Sync already in progress, skipping...');
    return;
  }

  isSyncing = true;
  console.log('[NPM Sync] Starting scheduled NPM dependency sync...');

  try {
    const resolvedRootPath = rootPath || process.cwd();
    const rootDir = path.resolve(resolvedRootPath);

    // Scan monorepo
    const packages = await scanMonorepo(rootDir);

    // Process each package's dependencies
    for (const pkg of packages) {
      try {
        const outdatedDeps = await checkOutdatedDependencies(pkg);

        // Update database
        for (const dep of outdatedDeps) {
          await prisma.dependencyInfo.upsert({
            where: {
              name_packageName: {
                name: dep.name,
                packageName: pkg.name,
              },
            },
            update: {
              version: dep.version,
              latest: dep.latest,
              status: dep.status,
              type: dep.type,
              outdated: dep.outdated,
            },
            create: {
              name: dep.name,
              packageName: pkg.name,
              version: dep.version,
              latest: dep.latest,
              status: dep.status,
              type: dep.type,
              outdated: dep.outdated || false,
            },
          });
        }
      } catch (error) {
        console.error(`[NPM Sync] Failed to sync package ${pkg.name}:`, error);
      }
    }

    console.log('[NPM Sync] Completed successfully.');
  } catch (error) {
    console.error('[NPM Sync] Fatal error during sync:', error);
  } finally {
    isSyncing = false;
  }
}

export function startNpmSyncWorker(rootPath: string) {
  // Run immediately on startup
  runNpmSync(rootPath);

  // Then run every hour (3600000 ms)
  const HOURLY_INTERVAL = 60 * 60 * 1000;

  syncInterval = setInterval(() => {
    runNpmSync(rootPath);
  }, HOURLY_INTERVAL);

  console.log('[NPM Sync] Worker started (Hourly sync).');
}

export function stopNpmSyncWorker() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('[NPM Sync] Worker stopped.');
  }
}
