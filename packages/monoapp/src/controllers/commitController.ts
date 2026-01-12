


import { getCommitsByPathService } from '../services/commitService';

export const getCommitsByPath = async (_req: any, res: any) => {

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
  } catch (error: any) {
    console.error('Error fetching commit details:', error);
    res.status(500).json({
      error: 'Failed to fetch commit details',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
