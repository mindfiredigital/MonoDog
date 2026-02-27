import { Request, Response } from 'express';
import { AppLogger } from '../middleware/logger';
import { updatePackageConfigurationService } from '../services/config-service';
import { getPackageDetailService, getPackagesService, refreshPackagesService } from '../services/package-service';
import { OPERATION_ERRORS, VALIDATION_ERRORS } from '../constants/error-messages';
import { extractErrorMessage } from '../constants/error-messages';
import { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_INTERNAL_SERVER_ERROR } from '../constants/http';

export const getPackages = async (_req: Request, res: Response) => {
  try {
    const transformedPackages = await getPackagesService(_req.app.locals.rootPath);
    res.json(transformedPackages);
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ error: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES, message: extractErrorMessage(error) });
  }
}

export const refreshPackages = async (_req: Request, res: Response) => {
  AppLogger.info('Refreshing packages from source: ' + _req.app.locals.rootPath);

  try {
    const packages = await refreshPackagesService(_req.app.locals.rootPath);
    res.json(packages);
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ error: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES, message: extractErrorMessage(error) });
  }
}

export const getPackageDetail = async (_req: Request, res: Response) => {
  const { name } = _req.params;
  try {
    const packageDetail = await getPackageDetailService(name)
    res.json(packageDetail);
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ error: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES, message: extractErrorMessage(error) });
  }
}

export const updatePackageConfig = async (req: Request, res: Response) => {
  try {
    const { packageName, config, packagePath } = req.body;

    if (!packageName || !config || !packagePath) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.INVALID_REQUEST,
        message: 'Package name, configuration, and package path are required',
      });
    }

    AppLogger.info('Updating package configuration for: ' + packageName);
    AppLogger.debug('Package path: ' + packagePath);

    const updatedPackage = await updatePackageConfigurationService(packagePath, packageName, config);

    return res.json({
      success: true,
      message: 'Package configuration updated successfully',
      package: updatedPackage,
      preservedFields: true,
    });
  } catch (error) {
    return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_SAVE_CONFIG,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}

