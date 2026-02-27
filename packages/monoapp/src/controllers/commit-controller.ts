


import { Request, Response } from 'express';
import { AppLogger } from '../middleware/logger';
import { getCommitsByPathService } from '../services/commit-service';
import { OPERATION_ERRORS } from '../constants/error-messages';
import { HTTP_STATUS_INTERNAL_SERVER_ERROR } from '../constants/http';

export const getCommitsByPath = async (_req: Request, res: Response) => {

  try {
    const { packagePath } = _req.params;
    const decodedPath = decodeURIComponent(packagePath);

    AppLogger.debug('Fetching commits for path: ' + decodedPath);
    AppLogger.debug('Current working directory: ' + process.cwd());

    const commits = await getCommitsByPathService(decodedPath);
    AppLogger.info(
      `Successfully fetched ${commits.length} commits for ${decodedPath}`
    );
    res.json(commits);
  } catch (error: unknown) {
    const err = error as Error & { message?: string; stack?: string };
    AppLogger.error('Error fetching commit details', err);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      error: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
      message: err?.message,
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    });
  }
}
