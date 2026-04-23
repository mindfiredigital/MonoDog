import { Request, Response } from 'express';
import {
  getSystemHealth,
  getPackageHealthMetrics,
  getAllPackagesHealthMetrics,
  refreshPackagesHealth,
} from '../services/health.service';

export const getHealth = (req: Request, res: Response) => {
  try {
    const health = getSystemHealth();

    res.json(health);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch health status',
    });
  }
};

export const getPackageHealth = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const health = await getPackageHealthMetrics(name);

    res.json(health);
  } catch (error) {
    res
      .status(
        error instanceof Error && error.message === 'Package not found'
          ? 404
          : 500
      )
      .json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch health metrics',
      });
  }
};

export const getAllPackagesHealth = async (req: Request, res: Response) => {
  try {
    const response = await getAllPackagesHealthMetrics();

    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch health data from database',
    });
  }
};

export const refreshHealth = async (req: Request, res: Response) => {
  try {
    const rootPath = req.app.locals.rootPath;

    const response = await refreshPackagesHealth(rootPath);

    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch health metrics',
    });
  }
};
