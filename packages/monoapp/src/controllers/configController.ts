import { getConfigurationFilesService, updateConfigFileService, updatePackageConfigurationService } from '../services/configService';

export const getConfigurationFiles = async (_req: any, res: any) => {
  try {
    const rootDir = _req.app.locals.rootPath;
    console.log('Monorepo root directory:', rootDir);

    const configFiles = await getConfigurationFilesService(rootDir);
    res.json(configFiles);
  } catch (error) {
    console.error('Error fetching configuration files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configuration files',
    });
  }
}

export const updateConfigFile = async (_req: any, res: any) => {
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
    console.error('Error saving configuration file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save configuration file',
    });
  }
}
