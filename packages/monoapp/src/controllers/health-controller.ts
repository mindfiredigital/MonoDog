import { Request, Response } from 'express';
import { AppLogger } from '../middleware/logger';
import { getHealthSummaryService, healthRefreshService } from '../services/health-service';

export const getPackagesHealth = async (_req: Request, res: Response) => {
  try {
    const health = await getHealthSummaryService();
    res.json(health);
  } catch (error) {
    AppLogger.error('Error fetching health data from database:', error as Error);
    res
      .status(500)
      .json({ error: 'Failed to fetch health data from database' });
  }
}

export const refreshHealth = async (_req: Request, res: Response) => {
  try {
    const health = await healthRefreshService(_req.app.locals.rootPath);
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health metrics' });
  }
}
