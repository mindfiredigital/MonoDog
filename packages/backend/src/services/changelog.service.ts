import fs from 'fs/promises';
import path from 'path';
import { AppLogger } from '../middleware/logger';
import { ReleaseData } from '../types/changelog.types';

// Parse the local CHANGELOG.md file
async function parseChangelog(packagePath: string): Promise<ReleaseData[]> {
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

export { parseChangelog, fetchGitHubReleases };
