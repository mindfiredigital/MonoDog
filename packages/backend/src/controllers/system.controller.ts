import { Request, Response } from 'express';
import {
  getSystemInformation,
  getMonorepoStats,
} from '../services/system.service';

export const getSystemInfo = (req: Request, res: Response) => {
  try {
    const systemInfo = getSystemInformation();

    res.json(systemInfo);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch system information',
    });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await getMonorepoStats();

    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch statistics',
    });
  }
};
