


import { Request, Response } from 'express';
import { getCommitsByPathService } from '../services/commit-service';

export const getCommitsByPath = async (_req: Request, res: Response) => {

  try {
    const { packagePath } = _req.params;
    const decodedPath = decodeURIComponent(packagePath);

    console.log('Fetching commits for path:', decodedPath);
    console.log('Current working directory:', process.cwd());

    const commits = await getCommitsByPathService(decodedPath);
    console.log(
      `Successfully fetched ${commits.length} commits for ${decodedPath}`
    );
    res.json(commits);
  } catch (error: unknown) {
    const err = error as Error & { message?: string; stack?: string };
    console.error('Error fetching commit details:', error);
    res.status(500).json({
      error: 'Failed to fetch commit details',
      message: err?.message,
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    });
  }
}
