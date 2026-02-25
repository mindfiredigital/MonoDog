"use strict";
/**
 * GitHub API Service
 * Handles all GitHub API interactions including OAuth and permission checks
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeCodeForToken = exchangeCodeForToken;
exports.getAuthenticatedUser = getAuthenticatedUser;
exports.getUserEmail = getUserEmail;
exports.getRepositoryPermission = getRepositoryPermission;
exports.mapPermissionToRole = mapPermissionToRole;
exports.hasPermission = hasPermission;
exports.validateToken = validateToken;
exports.generateAuthorizationUrl = generateAuthorizationUrl;
const https_1 = __importDefault(require("https"));
const logger_1 = require("../middleware/logger");
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_OAUTH_BASE = 'https://github.com';
/**
 * Make an HTTPS request to GitHub API
 */
function makeGitHubRequest(options, data) {
    return new Promise((resolve, reject) => {
        const request = https_1.default.request(options, (response) => {
            let body = '';
            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                try {
                    if (response.statusCode && response.statusCode >= 400) {
                        reject(new Error(`GitHub API error: ${response.statusCode} - ${body}`));
                    }
                    else {
                        const result = body ? JSON.parse(body) : {};
                        resolve(result);
                    }
                }
                catch (error) {
                    reject(new Error(`Failed to parse GitHub API response: ${error}`));
                }
            });
        });
        request.on('error', (error) => {
            logger_1.AppLogger.error(`GitHub API request failed: ${error.message}`);
            reject(error);
        });
        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('GitHub API request timeout'));
        });
        if (data) {
            request.write(data);
        }
        request.end();
    });
}
/**
 * Exchange OAuth code for access token
 */
async function exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
    const payload = JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
    });
    const options = {
        hostname: 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': String(Buffer.byteLength(payload)),
            Accept: 'application/json',
        },
    };
    try {
        const response = await makeGitHubRequest(options, payload);
        if (response.error) {
            throw new Error(`OAuth exchange failed: ${response.error}`);
        }
        logger_1.AppLogger.debug('Successfully exchanged OAuth code for access token');
        return response;
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to exchange OAuth code: ${error}`);
        throw error;
    }
}
/**
 * Get authenticated user information
 */
async function getAuthenticatedUser(accessToken) {
    const options = {
        hostname: 'api.github.com',
        path: '/user',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'MonoDog',
            Accept: 'application/vnd.github+json',
        },
    };
    try {
        const user = await makeGitHubRequest(options);
        logger_1.AppLogger.debug(`Retrieved user info: ${user.login}`);
        return user;
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to get user info: ${error}`);
        throw error;
    }
}
/**
 * Get user's email from GitHub (with proper scopes)
 */
async function getUserEmail(accessToken) {
    const options = {
        hostname: 'api.github.com',
        path: '/user/emails',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'MonoDog',
            Accept: 'application/vnd.github+json',
        },
    };
    try {
        const emails = await makeGitHubRequest(options);
        const primaryEmail = emails.find((e) => e.primary && e.verified);
        return primaryEmail?.email || null;
    }
    catch (error) {
        logger_1.AppLogger.warn(`Failed to get user email: ${error}`);
        return null;
    }
}
/**
 * Get user's permission for a specific repository
 * Returns the user's permission level in the target repository
 */
async function getRepositoryPermission(accessToken, owner, repo, username) {
    const options = {
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/collaborators/${username}/permission`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'MonoDog',
            Accept: 'application/vnd.github+json',
        },
    };
    try {
        const response = await makeGitHubRequest(options);
        logger_1.AppLogger.debug(`Retrieved permission for ${username} in ${owner}/${repo}: ${response.permission}`);
        return response;
    }
    catch (error) {
        logger_1.AppLogger.warn(`Failed to get repository permission for ${username} in ${owner}/${repo}: ${error}`);
        // If error (likely 404 or no access), return 'none' permission
        return { permission: 'none' };
    }
}
/**
 * Map GitHub permission to MonoDog role
 */
function mapPermissionToRole(permission) {
    switch (permission) {
        case 'admin':
            return 'Admin';
        case 'maintain':
            return 'Maintainer';
        case 'write':
        case 'read':
            return 'Collaborator';
        case 'none':
        default:
            return 'Denied';
    }
}
/**
 * Check if user has required permission level
 */
function hasPermission(userPermission, requiredPermission) {
    const permissionHierarchy = {
        admin: 4,
        maintain: 3,
        write: 2,
        read: 1,
        none: 0,
    };
    return (permissionHierarchy[userPermission] >= permissionHierarchy[requiredPermission]);
}
/**
 * Validate OAuth token is still valid
 */
async function validateToken(accessToken) {
    try {
        await getAuthenticatedUser(accessToken);
        return true;
    }
    catch (error) {
        logger_1.AppLogger.warn(`Token validation failed: ${error}`);
        return false;
    }
}
/**
 * Generate OAuth authorization URL
 */
function generateAuthorizationUrl(clientId, redirectUri, state, scopes = ['read:user', 'user:email', 'repo']) {
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        scope: scopes.join(','),
        allow_signup: 'true',
    });
    return `${GITHUB_OAUTH_BASE}/login/oauth/authorize?${params.toString()}`;
}
