import { Request, Response } from 'express';
import { AppLogger } from '../middleware/logger';
import { getConfigurationFilesService, updateConfigFileService, updatePackageConfigurationService } from '../services/config-service';

export const getConfigurationFiles = async (_req: Request, res: Response) => {
  try {
    const rootDir = _req.app.locals.rootPath;
    AppLogger.debug('Monorepo root directory: ' + rootDir);

    const configFiles = await getConfigurationFilesService(rootDir);
    res.json(configFiles);
  } catch (error) {
    AppLogger.error('Error fetching configuration files', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configuration files',
    });
  }
}

export const updateConfigFile = async (_req: Request, res: Response) => {
  try {
    const { id } = _req.params;
    const { content } = _req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }
    const rootDir = _req.app.locals.rootPath;
    const result = await updateConfigFileService(id, rootDir, content);
    res.json(result);
  } catch (error) {
    AppLogger.error('Error saving configuration file', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to save configuration file',
    });
  }
}
