/**
 * Scheduled Release Worker
 * Background interval that checks for due scheduled releases and triggers them.
 */

import { prisma } from '../db/prisma';
import { AppLogger } from '../middleware/logger';

import {
  updateScheduledReleaseStatus,
  deleteOldPipelines,
} from '../services/pipeline-service';
import { getRepositoryInfoFromGit } from '../utils/utilities';
import { createChangesetPullRequest } from '../services/github-repo-service';
import { decryptToken } from '../utils/encryption';

const CHECK_INTERVAL_MS = 60 * 1000; // Check every 60 seconds
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Cleanup every 1 hour

let checkIntervalId: ReturnType<typeof setInterval> | null = null;
let cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Check for due pending releases and execute them
 */
async function checkAndExecuteReleases(rootPath: string): Promise<void> {
  try {
    const now = new Date();

    // Find all pending releases that are due (scheduledAt <= now)
    const dueReleases = await prisma.scheduledRelease.findMany({
      where: {
        status: 'pending',
        scheduledAt: { lte: now },
      },
      include: { package: true },
    });

    if (dueReleases.length === 0) return;

    AppLogger.info(
      `[ScheduledReleaseWorker] Found ${dueReleases.length} due release(s) to execute`
    );

    for (const release of dueReleases) {
      try {
        // Mark as in-progress
        await updateScheduledReleaseStatus(release.id, 'in-progress');

        AppLogger.info(
          `[ScheduledReleaseWorker] Triggering release: ${release.packageName}@${release.releaseVersion}`
        );

        let accessToken: string | null = null;
        if (release.triggeredBy) {
          try {
            const session = await prisma.session.findFirst({
              where: { login: release.triggeredBy },
              orderBy: { createdAt: 'desc' },
            });
            if (session) {
              accessToken = decryptToken(session.accessToken);
            }
          } catch (e) {
            AppLogger.warn(
              `Failed to fetch session for user ${release.triggeredBy}: ${e}`
            );
          }
        }

        // Calculate bump type by comparing current and target versions
        let bumpType = 'patch';
        if (release.package?.version && release.releaseVersion) {
          const [cMajor, cMinor] = release.package.version
            .split('.')
            .map(Number);
          const [nMajor, nMinor] = release.releaseVersion
            .split('.')
            .map(Number);

          if (!isNaN(cMajor) && !isNaN(nMajor) && nMajor > cMajor) {
            bumpType = 'major';
          } else if (!isNaN(cMinor) && !isNaN(nMinor) && nMinor > cMinor) {
            bumpType = 'minor';
          }
        }

        // Generate the changeset content in memory
        const changesetContent = `---\n"${release.packageName}": ${bumpType}\n---\n\nScheduled release for ${release.packageName}\n`;

        // Get repository info
        const repoInfo = await getRepositoryInfoFromGit(rootPath);

        let result = {
          success: false,
          message: 'Missing repository info or access token',
        };

        if (repoInfo && accessToken) {
          result = await createChangesetPullRequest(
            repoInfo.owner,
            repoInfo.repo,
            release.packageName,
            changesetContent,
            accessToken
          );
        } else {
          AppLogger.warn(
            `[ScheduledReleaseWorker] Cannot create PR for ${release.packageName}: Missing token or repo info`
          );
        }

        if (result.success) {
          await updateScheduledReleaseStatus(release.id, 'triggered');
          AppLogger.info(
            `[ScheduledReleaseWorker] Successfully triggered: ${release.packageName}@${release.releaseVersion}`
          );

          // Log activity
          await prisma.activityLog.create({
            data: {
              type: 'scheduled_release',
              packageName: release.packageName,
              message: `Scheduled release ${release.releaseVersion} triggered automatically`,
              metadata: JSON.stringify({
                releaseVersion: release.releaseVersion,
                triggeredBy: release.triggeredBy,
                scheduledAt: release.scheduledAt.toISOString(),
              }),
            },
          });
        } else {
          await updateScheduledReleaseStatus(release.id, 'failed');
          AppLogger.error(
            `[ScheduledReleaseWorker] Failed to trigger: ${release.packageName}@${release.releaseVersion} — ${result.message}`
          );
        }
      } catch (releaseError) {
        // Mark individual release as failed
        await updateScheduledReleaseStatus(release.id, 'failed');
        AppLogger.error(
          `[ScheduledReleaseWorker] Error processing release ${release.id}: ${releaseError}`
        );
      }

      // A small 2-second delay between processing multiple releases to avoid GitHub API abuse detection
      if (dueReleases.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } catch (error) {
    AppLogger.error(`[ScheduledReleaseWorker] Check cycle failed: ${error}`);
  }
}

/**
 * Periodic cleanup of old pipeline records
 */
async function performCleanup(): Promise<void> {
  try {
    const deletedCount = await deleteOldPipelines(90);
    if (deletedCount > 0) {
      AppLogger.info(
        `[ScheduledReleaseWorker] Cleaned up ${deletedCount} old pipeline record(s)`
      );
    }
  } catch (error) {
    AppLogger.error(`[ScheduledReleaseWorker] Cleanup failed: ${error}`);
  }
}

/**
 * Start the scheduled release worker
 * Call this once when the server boots.
 */
export function startScheduledReleaseWorker(rootPath: string): void {
  if (checkIntervalId) {
    AppLogger.warn(
      '[ScheduledReleaseWorker] Worker already running, skipping duplicate start'
    );
    return;
  }

  AppLogger.info(
    `[ScheduledReleaseWorker] Started (check interval: ${CHECK_INTERVAL_MS / 1000}s, cleanup interval: ${CLEANUP_INTERVAL_MS / 1000}s)`
  );

  // Run the first check immediately
  checkAndExecuteReleases(rootPath);

  // Then run on interval
  checkIntervalId = setInterval(() => {
    checkAndExecuteReleases(rootPath);
  }, CHECK_INTERVAL_MS);

  // Cleanup old pipelines hourly
  cleanupIntervalId = setInterval(() => {
    performCleanup();
  }, CLEANUP_INTERVAL_MS);
}

/**
 * Stop the scheduled release worker (for graceful shutdown)
 */
export function stopScheduledReleaseWorker(): void {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
  AppLogger.info('[ScheduledReleaseWorker] Stopped');
}
