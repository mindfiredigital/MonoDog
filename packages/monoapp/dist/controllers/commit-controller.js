"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitsByPath = void 0;
const commit_service_1 = require("../services/commit-service");
const getCommitsByPath = async (_req, res) => {
    try {
        const { packagePath } = _req.params;
        const decodedPath = decodeURIComponent(packagePath);
        console.log('Fetching commits for path:', decodedPath);
        console.log('Current working directory:', process.cwd());
        const commits = await (0, commit_service_1.getCommitsByPathService)(decodedPath);
        console.log(`Successfully fetched ${commits.length} commits for ${decodedPath}`);
        res.json(commits);
    }
    catch (error) {
        const err = error;
        console.error('Error fetching commit details:', error);
        res.status(500).json({
            error: 'Failed to fetch commit details',
            message: err?.message,
            stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
        });
    }
};
exports.getCommitsByPath = getCommitsByPath;
