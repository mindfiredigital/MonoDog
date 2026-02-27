"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshHealth = exports.getPackagesHealth = void 0;
const logger_1 = require("../middleware/logger");
const health_service_1 = require("../services/health-service");
const error_messages_1 = require("../constants/error-messages");
const http_1 = require("../constants/http");
const getPackagesHealth = async (_req, res) => {
    try {
        const health = await (0, health_service_1.getHealthSummaryService)();
        res.json(health);
    }
    catch (error) {
        logger_1.AppLogger.error('Error fetching health data from database:', error);
        res
            .status(http_1.HTTP_STATUS_INTERNAL_SERVER_ERROR)
            .json({ error: error_messages_1.OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES });
    }
};
exports.getPackagesHealth = getPackagesHealth;
const refreshHealth = async (_req, res) => {
    try {
        const health = await (0, health_service_1.healthRefreshService)(_req.app.locals.rootPath);
        res.json(health);
    }
    catch (error) {
        res.status(http_1.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ error: error_messages_1.OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES });
    }
};
exports.refreshHealth = refreshHealth;
