"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitsByPath = void 0;
const commitService_1 = require("../services/commitService");
const getCommitsByPath = async (_req, res) => {
    try {
        const { packagePath } = _req.params;
        const decodedPath = decodeURIComponent(packagePath);
        console.log('🔍 Fetching commits for path:', decodedPath);
        console.log('📁 Current working directory:', process.cwd());
        const commits = await (0, commitService_1.getCommitsByPathService)(decodedPath);
        console.log(`✅ Successfully fetched ${commits.length} commits for ${decodedPath}`);
        res.json(commits);
    }
    catch (error) {
        console.error('💥 Error fetching commit details:', error);
        res.status(500).json({
            error: 'Failed to fetch commit details',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};
exports.getCommitsByPath = getCommitsByPath;
