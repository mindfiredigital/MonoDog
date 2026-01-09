import { getHealthSummaryService, healthRefreshService } from '../services/healthService';

export const getPackagesHealth = async (_req: any, res: any) => {
  try {
    const health = await getHealthSummaryService();
    res.json(health);
  } catch (error) {
    console.error('Error fetching health data from database:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch health data from database' });
  }
}

export const refreshHealth = async (_req: any, res: any) => {
  try {
    const health = await healthRefreshService(_req.app.locals.rootPath);
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health metrics' });
  }
}
