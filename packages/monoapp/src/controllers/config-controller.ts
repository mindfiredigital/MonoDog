import { Request, Response } from 'express';
import { AppLogger } from '../middleware/logger';
import { getConfigurationFilesService, updateConfigFileService, updatePackageConfigurationService } from '../services/config-service';
import { OPERATION_ERRORS, VALIDATION_ERRORS } from '../constants/error-messages';
import { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_INTERNAL_SERVER_ERROR } from '../constants/http';

export const getConfigurationFiles = async (_req: Request, res: Response) => {
  try {
    const rootDir = _req.app.locals.rootPath;
    AppLogger.debug('Monorepo root directory: ' + rootDir);

    const configFiles = await getConfigurationFilesService(rootDir);
    res.json(configFiles);
  } catch (error) {
    AppLogger.error('Error fetching configuration files', error as Error);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
    });
  }
}

export const updateConfigFile = async (_req: Request, res: Response) => {
  try {
    const { id } = _req.params;
    const { content } = _req.body;

    if (!content) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.INVALID_REQUEST,
      });
    }
    const rootDir = _req.app.locals.rootPath;
    const result = await updateConfigFileService(id, rootDir, content);
    res.json(result);
  } catch (error) {
    AppLogger.error('Error saving configuration file', error as Error);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_SAVE_CONFIG,
    });
  }
}
