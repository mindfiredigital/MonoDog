import { Request, Response } from 'express';
import { AppLogger } from '../middleware/logger';
import {
  parseChangelog,
  fetchGitHubReleases,
  getVersionCommits,
} from '../services/changelog.service';
import { ReleaseData } from '../types/changelog.types';
import { getPrismaClient } from '../repositories';
const prisma = getPrismaClient();

const getChangelog = async (req: Request, res: Response) => {
  try {
    const { packageName } = req.params;
    const owner = req.query.owner as string;
    const repo = req.query.repo as string;

    const accessToken = req.accessToken;

    if (!packageName) {
      return res
        .status(400)
        .json({ success: false, message: 'Package name is required' });
    }

    // Fetch Local Changesets
    const pkg = await prisma.package.findUnique({
      where: { name: packageName },
    });
    if (!pkg)
      return res
        .status(404)
        .json({ success: false, message: 'Package not found' });

    const localEntries = await parseChangelog(pkg.path);

    // Fetch GitHub Releases (if owner, repo, and token are provided)
    let githubEntries: ReleaseData[] = [];
    if (owner && repo && accessToken) {
      githubEntries = await fetchGitHubReleases(owner, repo, accessToken);
    }

    // Merge and Sort the entries by Date (Latest first)
    const mergedMap = new Map<string, ReleaseData>();

    [...localEntries, ...githubEntries].forEach(entry => {
      if (!mergedMap.has(entry.version)) {
        mergedMap.set(entry.version, entry);
      }
    });

    const sortedReleases = Array.from(mergedMap.values()).sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    // Attach Commits to each release
    for (let i = 0; i < sortedReleases.length; i++) {
      const currentRelease = sortedReleases[i];
      const previousRelease = sortedReleases[i + 1];

      const endDate = currentRelease.date
        ? new Date(currentRelease.date)
        : new Date();
      const startDate = previousRelease?.date
        ? new Date(previousRelease.date)
        : null;

      // Fetch the commits that happened between the previous release and this release
      currentRelease.commits = await getVersionCommits(
        packageName,
        startDate,
        endDate
      );
    }

    return res.status(200).json(sortedReleases);
  } catch (error) {
    AppLogger.error(`Error in getChangelog: ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch changelog history',
    });
  }
};

export { getChangelog };
