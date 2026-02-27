"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfigFile = exports.getConfigurationFiles = void 0;
const logger_1 = require("../middleware/logger");
const config_service_1 = require("../services/config-service");
const error_messages_1 = require("../constants/error-messages");
const http_1 = require("../constants/http");
const getConfigurationFiles = async (_req, res) => {
    try {
        const rootDir = _req.app.locals.rootPath;
        logger_1.AppLogger.debug('Monorepo root directory: ' + rootDir);
        const configFiles = await (0, config_service_1.getConfigurationFilesService)(rootDir);
        res.json(configFiles);
    }
    catch (error) {
        logger_1.AppLogger.error('Error fetching configuration files', error);
        res.status(http_1.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error_messages_1.OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
        });
    }
};
exports.getConfigurationFiles = getConfigurationFiles;
const updateConfigFile = async (_req, res) => {
    try {
        const { id } = _req.params;
        const { content } = _req.body;
        if (!content) {
            return res.status(http_1.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                error: error_messages_1.VALIDATION_ERRORS.INVALID_REQUEST,
            });
        }
        const rootDir = _req.app.locals.rootPath;
        const result = await (0, config_service_1.updateConfigFileService)(id, rootDir, content);
        res.json(result);
    }
    catch (error) {
        logger_1.AppLogger.error('Error saving configuration file', error);
        res.status(http_1.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error_messages_1.OPERATION_ERRORS.FAILED_TO_SAVE_CONFIG,
        });
    }
};
exports.updateConfigFile = updateConfigFile;
