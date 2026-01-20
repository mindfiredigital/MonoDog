"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfigFile = exports.getConfigurationFiles = void 0;
const logger_1 = require("../middleware/logger");
const config_service_1 = require("../services/config-service");
const getConfigurationFiles = async (_req, res) => {
    try {
        const rootDir = _req.app.locals.rootPath;
        logger_1.AppLogger.debug('Monorepo root directory: ' + rootDir);
        const configFiles = await (0, config_service_1.getConfigurationFilesService)(rootDir);
        res.json(configFiles);
    }
    catch (error) {
        logger_1.AppLogger.error('Error fetching configuration files', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch configuration files',
        });
    }
};
exports.getConfigurationFiles = getConfigurationFiles;
const updateConfigFile = async (_req, res) => {
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
        const result = await (0, config_service_1.updateConfigFileService)(id, rootDir, content);
        res.json(result);
    }
    catch (error) {
        logger_1.AppLogger.error('Error saving configuration file', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save configuration file',
        });
    }
};
exports.updateConfigFile = updateConfigFile;
