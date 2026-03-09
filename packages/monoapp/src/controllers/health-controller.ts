import { Request, Response } from 'express';
import { AppLogger } from '../middleware/logger';
import { getHealthSummaryService, healthRefreshService } from '../services/health-service';
import { OPERATION_ERRORS } from '../constants/error-messages';
import { HTTP_STATUS_INTERNAL_SERVER_ERROR } from '../constants/http';

export const getPackagesHealth = async (_req: Request, res: Response) => {
  try {
    const health = await getHealthSummaryService();
    res.json(health);
  } catch (error) {
    AppLogger.error('Error fetching health data from database:', error as Error);
    res
      .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .json({ error: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES });
  }
}

export const refreshHealth = async (_req: Request, res: Response) => {
  try {
    const health = await healthRefreshService(_req.app.locals.rootPath);
    res.json(health);
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ error: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES });
  }
}
