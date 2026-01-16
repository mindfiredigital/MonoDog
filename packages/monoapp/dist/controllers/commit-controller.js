"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitsByPath = void 0;
const logger_1 = require("../middleware/logger");
const commit_service_1 = require("../services/commit-service");
const getCommitsByPath = async (_req, res) => {
    try {
        const { packagePath } = _req.params;
        const decodedPath = decodeURIComponent(packagePath);
        logger_1.AppLogger.debug('Fetching commits for path: ' + decodedPath);
        logger_1.AppLogger.debug('Current working directory: ' + process.cwd());
        const commits = await (0, commit_service_1.getCommitsByPathService)(decodedPath);
        logger_1.AppLogger.info(`Successfully fetched ${commits.length} commits for ${decodedPath}`);
        res.json(commits);
    }
    catch (error) {
        const err = error;
        logger_1.AppLogger.error('Error fetching commit details', err);
        res.status(500).json({
            error: 'Failed to fetch commit details',
            message: err?.message,
            stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
        });
    }
};
exports.getCommitsByPath = getCommitsByPath;
