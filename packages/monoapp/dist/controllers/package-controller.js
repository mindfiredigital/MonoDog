"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePackageConfig = exports.getPackageDetail = exports.refreshPackages = exports.getPackages = void 0;
const logger_1 = require("../middleware/logger");
const config_service_1 = require("../services/config-service");
const package_service_1 = require("../services/package-service");
const getPackages = async (_req, res) => {
    try {
        const transformedPackages = await (0, package_service_1.getPackagesService)(_req.app.locals.rootPath);
        res.json(transformedPackages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch packages, ' + error });
    }
};
exports.getPackages = getPackages;
const refreshPackages = async (_req, res) => {
    logger_1.AppLogger.info('Refreshing packages from source: ' + _req.app.locals.rootPath);
    try {
        const packages = await (0, package_service_1.refreshPackagesService)(_req.app.locals.rootPath);
        res.json(packages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to refresh packages' });
    }
};
exports.refreshPackages = refreshPackages;
const getPackageDetail = async (_req, res) => {
    const { name } = _req.params;
    try {
        const packageDetail = await (0, package_service_1.getPackageDetailService)(name);
        res.json(packageDetail);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch package details' });
    }
};
exports.getPackageDetail = getPackageDetail;
const updatePackageConfig = async (req, res) => {
    try {
        const { packageName, config, packagePath } = req.body;
        if (!packageName || !config || !packagePath) {
            return res.status(400).json({
                success: false,
                error: 'Package name, configuration, and package path are required',
            });
        }
        logger_1.AppLogger.info('Updating package configuration for: ' + packageName);
        logger_1.AppLogger.debug('Package path: ' + packagePath);
        const updatedPackage = await (0, config_service_1.updatePackageConfigurationService)(packagePath, packageName, config);
        return res.json({
            success: true,
            message: 'Package configuration updated successfully',
            package: updatedPackage,
            preservedFields: true,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to update package configuration',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
        });
    }
};
exports.updatePackageConfig = updatePackageConfig;
