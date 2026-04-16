import { Request, Response } from 'express';
import { getRecentActivity } from '../services/activity.service';

export const getActivity = async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const result = await getRecentActivity(Number(limit));

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch recent activity',
    });
  }
};
