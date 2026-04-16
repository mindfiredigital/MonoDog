import { Request, Response } from 'express';
import { getPackageCommits } from '../services/commits.service';

export const getCommits = async (req: Request, res: Response) => {
  try {
    const { packagePath } = req.params;

    const commits = await getPackageCommits(packagePath);

    res.json(commits);
  } catch (error: any) {
    const isNotFoundError = error.message?.includes('Package path not found');

    res.status(isNotFoundError ? 404 : 500).json({
      error: 'Failed to fetch commit details',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
