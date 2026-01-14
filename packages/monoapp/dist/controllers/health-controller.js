"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshHealth = exports.getPackagesHealth = void 0;
const health_service_1 = require("../services/health-service");
const getPackagesHealth = async (_req, res) => {
    try {
        const health = await (0, health_service_1.getHealthSummaryService)();
        res.json(health);
    }
    catch (error) {
        console.error('Error fetching health data from database:', error);
        res
            .status(500)
            .json({ error: 'Failed to fetch health data from database' });
    }
};
exports.getPackagesHealth = getPackagesHealth;
const refreshHealth = async (_req, res) => {
    try {
        const health = await (0, health_service_1.healthRefreshService)(_req.app.locals.rootPath);
        res.json(health);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch health metrics' });
    }
};
exports.refreshHealth = refreshHealth;
