import fs from 'fs/promises';
import path from 'path';
import { AppLogger } from '../middleware/logger';
import { ReleaseData } from '../types/changelog.types';

// Parse the local CHANGELOG.md file
async function parseChangelog(packagePath: string): Promise<ReleaseData[]> {
  try {
    const changelogPath = path.join(packagePath, 'CHANGELOG.md');
    const content = await fs.readFile(changelogPath, 'utf-8');

    // eslint-disable-next-line no-useless-escape
    const versionBlocks = content.split(
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

export { parseChangelog };
