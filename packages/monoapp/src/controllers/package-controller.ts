import { Request, Response } from 'express';
import { updatePackageConfigurationService } from '../services/config-service';
import { getPackageDetailService, getPackagesService, refreshPackagesService } from '../services/package-service';

export const getPackages = async (_req: Request, res: Response) => {
  try {
    const transformedPackages = await getPackagesService(_req.app.locals.rootPath);
    res.json(transformedPackages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages, ' + error });
  }
}

export const refreshPackages = async (_req: Request, res: Response) => {
  console.log('Refreshing packages from source...'+ _req.app.locals.rootPath);

  try {
    const packages = await refreshPackagesService(_req.app.locals.rootPath);
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh packages' });
  }
}

export const getPackageDetail = async (_req: Request, res: Response) => {
  const { name } = _req.params;
  try {
    const packageDetail = await getPackageDetailService(name)
    res.json(packageDetail);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch package details' });
  }
}

export const updatePackageConfig = async (req: Request, res: Response) => {
  try {
    const { packageName, config, packagePath } = req.body;

    if (!packageName || !config || !packagePath) {
      return res.status(400).json({
        success: false,
        error: 'Package name, configuration, and package path are required',
      });
    }

    console.log('Updating package configuration for:', packageName);
    console.log('Package path:', packagePath);

    const updatedPackage = await updatePackageConfigurationService(packagePath, packageName, config);

    return res.json({
      success: true,
      message: 'Package configuration updated successfully',
      package: updatedPackage,
      preservedFields: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update package configuration',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}

