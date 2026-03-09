"use strict";
/**
 * Changeset Service
 * Handles changeset generation, validation, and publishing
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspacePackages = getWorkspacePackages;
exports.getExistingChangesets = getExistingChangesets;
exports.calculateNewVersions = calculateNewVersions;
exports.validateChangeset = validateChangeset;
exports.generateChangeset = generateChangeset;
exports.isWorkingTreeClean = isWorkingTreeClean;
exports.triggerPublishPipeline = triggerPublishPipeline;
exports.checkCIPassing = checkCIPassing;
exports.checkVersionAvailableOnNpm = checkVersionAvailableOnNpm;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const https_1 = __importDefault(require("https"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const logger_1 = require("../middleware/logger");
const package_service_1 = require("./package-service");
const github_actions_service_1 = require("./github-actions-service");
const api_messages_1 = require("../constants/api-messages");
const error_messages_1 = require("../constants/error-messages");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
/**
 * Get all workspace packages
 */
async function getWorkspacePackages(rootPath) {
    try {
        // Get packages from package service
        const packages = await (0, package_service_1.getPackagesService)(rootPath);
        return packages.map((pkg) => ({
            name: pkg.name,
            version: pkg.version || '0.0.0',
            path: pkg.path,
            private: pkg.private || false,
            dependencies: pkg.dependencies || {},
            devDependencies: pkg.devDependencies || {},
        }));
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to get workspace packages: ${error}`);
        throw error;
    }
}
/**
 * Get existing unpublished changesets
 */
async function getExistingChangesets(rootPath) {
    try {
        const changesetsDir = path_1.default.join(rootPath, '.changeset');
        try {
            const files = await promises_1.default.readdir(changesetsDir);
            return files
                .filter((file) => file.endsWith('.md') && file !== 'README.md')
                .map((file) => file.replace('.md', ''));
        }
        catch {
            // Directory doesn't exist yet
            return [];
        }
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to get existing changesets: ${error}`);
        return [];
    }
}
/**
 * Calculate new versions for selected packages
 */
function calculateNewVersions(packages, bumps) {
    return packages.map((pkg) => {
        const bump = bumps.find((b) => b.package === pkg.name);
        const bumpType = bump?.bumpType || 'patch';
        const newVersion = calculateVersion(pkg.version, bumpType);
        return {
            package: pkg.name,
            currentVersion: pkg.version,
            newVersion,
            bumpType,
        };
    });
}
/**
 * Calculate new version based on bump type
 */
function calculateVersion(currentVersion, bumpType) {
    const parts = currentVersion.split('.').map((p) => parseInt(p, 10));
    const [major, minor = 0, patch = 0] = parts;
    switch (bumpType) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
        default:
            return `${major}.${minor}.${patch + 1}`;
    }
}
/**
 * Validate that changeset can be created
 */
async function validateChangeset(rootPath, packages, summary) {
    const errors = [];
    // Validate packages exist
    const allPackages = await getWorkspacePackages(rootPath);
    for (const pkgName of packages) {
        if (!allPackages.find((p) => p.name === pkgName)) {
            errors.push(`Package ${pkgName} not found`);
        }
    }
    // Validate summary
    if (!summary || summary.length < 10) {
        errors.push(error_messages_1.VALIDATION_ERRORS.SUMMARY_TOO_SHORT);
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Generate a new changeset
 */
async function generateChangeset(rootPath, packages, bumps, summary, createdBy) {
    try {
        // Validate input
        const validation = await validateChangeset(rootPath, packages, summary);
        if (!validation.valid) {
            return {
                success: false,
                message: validation.errors.join(', '),
            };
        }
        // Create .changeset directory if it doesn't exist
        const changesetsDir = path_1.default.join(rootPath, '.changeset');
        try {
            await promises_1.default.mkdir(changesetsDir, { recursive: true });
        }
        catch (error) {
            // Directory might already exist
        }
        // Generate unique changeset filename (using timestamp + random)
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        const changesetName = `${timestamp}-${random}`;
        const changesetPath = path_1.default.join(changesetsDir, `${changesetName}.md`);
        // Format changeset content
        let content = `---\n`;
        for (const pkg of packages) {
            const bump = bumps.find((b) => b.package === pkg);
            const bumpType = bump?.bumpType || 'patch';
            content += `"${pkg}": ${bumpType}\n`;
        }
        content += `---\n\n`;
        content += summary;
        // Write changeset file
        await promises_1.default.writeFile(changesetPath, content, 'utf-8');
        logger_1.AppLogger.info(`Changeset created: ${changesetName} by user: ${createdBy || 'unknown'}`);
        return {
            success: true,
            message: api_messages_1.CHANGESET_MESSAGES.CREATED,
            changeset: changesetName,
        };
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to generate changeset: ${error}`);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
/**
 * Check if working tree is clean
 */
async function isWorkingTreeClean(rootPath) {
    try {
        const { stdout } = await execPromise('git status --porcelain', {
            cwd: rootPath,
        });
        return stdout.trim().length === 0;
    }
    catch {
        return false;
    }
}
/**
 * Trigger CI pipeline for publishing
 */
async function triggerPublishPipeline(rootPath, publishedBy, selectedPackages) {
    try {
        logger_1.AppLogger.info(`Publishing workflow triggered by user: ${publishedBy || 'unknown'}`);
        // Commit the changeset if there are any changes
        try {
            const { stdout: status } = await execPromise('git status --porcelain', {
                cwd: rootPath,
            });
            if (status.trim()) {
                // Add changeset files
                await execPromise('git add .changeset/', { cwd: rootPath });
                // Commit with proper message
                await execPromise('git commit -m "chore: publish changeset" --no-verify', { cwd: rootPath });
                // Push to the current branch
                try {
                    const { stdout: branch } = await execPromise('git rev-parse --abbrev-ref HEAD', { cwd: rootPath });
                    const currentBranch = branch.trim();
                    await execPromise(`git push origin ${currentBranch}`, {
                        cwd: rootPath,
                    });
                    logger_1.AppLogger.info(`Pushed changeset to ${currentBranch}`);
                }
                catch (pushError) {
                    // If push fails, still continue - the workflow might be triggered manually
                    logger_1.AppLogger.warn(`Failed to push: ${pushError}`);
                }
            }
        }
        catch (gitError) {
            logger_1.AppLogger.warn(`Git operations failed: ${gitError}`);
            // Continue anyway - changesets might already be committed
        }
        logger_1.AppLogger.info('Publish pipeline initiated');
        return {
            success: true,
            message: 'Publishing workflow initiated',
            result: {
                timestamp: new Date().toISOString(),
            },
        };
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to trigger publish pipeline: ${error}`);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
/**
 * Check if CI pipeline is passing
 * Fetches the most recent workflow run and checks if it passed
 */
async function checkCIPassing(accessToken, owner, repo, workflowId, workflowPath) {
    try {
        if (!accessToken) {
            logger_1.AppLogger.warn('No access token available for CI check');
            return true; // Allow publishing if no token
        }
        const { runs } = await (0, github_actions_service_1.getWorkflowRuns)(owner, repo, accessToken, {
            workflowId,
            workflowPath,
            status: 'completed',
            per_page: 1,
        });
        if (!runs || runs.length === 0) {
            logger_1.AppLogger.warn('No completed workflow runs found');
            return true; // Allow if no runs exist
        }
        const latestRun = runs[0];
        const passed = latestRun.conclusion === 'success';
        if (passed) {
            logger_1.AppLogger.info('CI check passed: Latest workflow run succeeded');
        }
        else {
            logger_1.AppLogger.warn(`CI check failed: Latest run conclusion is ${latestRun.conclusion}`);
        }
        return passed;
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to check CI status: ${error}`);
        return true; // Allow on error
    }
}
/**
 * Check if a package version is available on npm registry
 * Returns true if version does NOT exist (safe to publish)
 * Returns false if version already exists
 */
async function checkVersionAvailableOnNpm(packageName, version) {
    return new Promise((resolve) => {
        try {
            const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}/${encodeURIComponent(version)}`;
            const request = https_1.default.get(url, (response) => {
                if (response.statusCode === 200) {
                    logger_1.AppLogger.warn(`NPM version check: Version ${version} of ${packageName} already exists`);
                    resolve(false); // Version exists, not available for publishing
                }
                else if (response.statusCode === 404) {
                    logger_1.AppLogger.info(`NPM version check: Version ${version} of ${packageName} is available`);
                    resolve(true); // Version doesn't exist, safe to publish
                }
                else {
                    logger_1.AppLogger.warn(`NPM check unexpected status ${response.statusCode}`);
                    resolve(true); // Default to allowing publish
                }
            });
            request.on('error', (error) => {
                logger_1.AppLogger.error(`Failed to check npm version: ${error}`);
                resolve(true); // Allow on error
            });
            request.setTimeout(5000, () => {
                request.destroy();
                logger_1.AppLogger.warn('NPM registry check timeout');
                resolve(true); // Allow on timeout
            });
        }
        catch (error) {
            logger_1.AppLogger.error(`NPM version check error: ${error}`);
            resolve(true); // Allow on error
        }
    });
}
