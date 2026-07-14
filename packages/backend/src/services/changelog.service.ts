import fs from 'fs/promises';
import path from 'path';
import { AppLogger } from '../middleware/logger';
import { ReleaseData } from '../types/changelog.types';
import { getPrismaClient } from '../repositories';
import { Commit } from '../types/database';

const prisma = getPrismaClient();

// In-memory cache for parsed changelogs
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
interface CachedChangelog {
  data: ReleaseData[];
  cachedAt: number;
}
const changelogCache = new Map<string, CachedChangelog>();

// Parse the local CHANGELOG.md file
async function parseChangelog(packagePath: string): Promise<ReleaseData[]> {
  // Check cache first
  const cached = changelogCache.get(packagePath);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const changelogPath = path.join(packagePath, 'CHANGELOG.md');
    const content = await fs.readFile(changelogPath, 'utf-8');

    const versionBlocks = content.split(
      // eslint-disable-next-line no-useless-escape
      /^##\s+\[?([\d\.]+(?:-[a-zA-Z0-9\.]+)?)]?(?:\s+-?\s+)?(.*)?$/m
    );

    const entries: ReleaseData[] = [];

    for (let i = 1; i < versionBlocks.length; i += 3) {
      const version = versionBlocks[i];
      const dateString = versionBlocks[i + 1]?.trim() || null;
      const body = versionBlocks[i + 2]?.trim() || '';

      entries.push({
        version,
        date: dateString,
        author: 'system',
        markdownBody: body,
        source: 'changelog',
        commits: [],
      });
    }

    // Store in cache
    changelogCache.set(packagePath, { data: entries, cachedAt: Date.now() });

    return entries;
  } catch (error) {
    AppLogger.warn(`No local CHANGELOG.md found at ${packagePath}`);
    return [];
  }
}

// Fetch official releases from GitHub API
async function fetchGitHubReleases(
  owner: string,
  repo: string,
  accessToken: string
): Promise<ReleaseData[]> {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'MonoDog',
      Accept: 'application/vnd.github+json',
    };

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases`,
      { headers }
    );

    if (!response.ok) return [];

    const data = await response.json();

    return data.map((release: any) => ({
      version: release.tag_name.replace(/^v/, ''),
      date: release.published_at,
      author: release.author?.login || 'Unknown',
      markdownBody: release.body || '',
      source: 'github',
      commits: [],
    }));
  } catch (error) {
    AppLogger.error(`Failed to fetch GitHub releases: ${error}`);
    return [];
  }
}

// fetch commits from DB using date
async function getVersionCommits(
  packageName: string,
  startDate: Date | null,
  endDate: Date
): Promise<any[]> {
  try {
    const commits = await prisma.commit.findMany({
      where: {
        packageName: packageName,
        date: {
          lte: endDate,
          ...(startDate && { gt: startDate }),
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return commits.map((c: Commit) => ({
      hash: c.hash,
      message: c.message,
      author: c.author,
      date: c.date?.toISOString() || '',
    }));
  } catch (error) {
    AppLogger.error(`Failed to fetch commits for ${packageName}: ${error}`);
    return [];
  }
}

export { parseChangelog, fetchGitHubReleases, getVersionCommits };
