import { Request, Response } from 'express';
import {
  getAllPackages,
  refreshAllPackages,
  getPackageByName,
  updatePackageConfig,
} from '../services/package.service';

export const getPackages = async (req: Request, res: Response) => {
  try {
    const rootPath = req.app.locals.rootPath;

    const packages = await getAllPackages(rootPath);

    res.json(packages);
  } catch (error) {
    console.error('Failed to fetch packages:', error);

    res.status(500).json({
      error:
        'Failed to fetch packages, ' +
        (error instanceof Error ? error.message : error),
    });
  }
};

export const refreshPackages = async (req: Request, res: Response) => {
  try {
    const rootPath = req.app.locals.rootPath;

    const packages = await refreshAllPackages(rootPath);

    res.json(packages);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to refresh packages',
    });
  }
};

export const getPackageDetails = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const result = await getPackageByName(name);

    res.json(result);
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
            : 'Failed to fetch package details',
      });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { packageName, config, packagePath } = req.body;

    const result = await updatePackageConfig(packageName, config, packagePath);

    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    const statusCode =
      errorMessage.includes('required') ||
      errorMessage.includes('JSON parsing error')
        ? 400
        : errorMessage.includes('not found')
          ? 404
          : 500;

    res.status(statusCode).json({
      success: false,
      error: 'Failed to update package configuration',
      message: errorMessage,
    });
  }
};
