import { Request, Response } from 'express';
import { searchMonorepoPackages } from '../services/search.service';

export const searchPackages = async (req: Request, res: Response) => {
  try {
    const { q: query, type, status } = req.query;

    const result = await searchMonorepoPackages(
      query as string,
      type as string,
      status as string
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to search packages',
    });
  }
};
