/**
 * GitHub API Service
 * Handles all GitHub API interactions including OAuth and permission checks
 */

import https from 'https';
import type {
  GitHubUser,
  RepositoryPermission,
  RepositoryPermissionResponse,
  CachedPermission,
  MonoDogPermissionRole,
} from '../types/auth';
import { AppLogger } from '../middleware/logger';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_OAUTH_BASE = 'https://github.com';

interface GitHubRequestOptions {
  hostname: string;
  path: string;
  method: string;
  headers: Record<string, string>;
}

/**
 * Make an HTTPS request to GitHub API
 */
function makeGitHubRequest<T>(
  options: GitHubRequestOptions,
  data?: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let body = '';

      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        try {
          if (response.statusCode && response.statusCode >= 400) {
            reject(
              new Error(
                `GitHub API error: ${response.statusCode} - ${body}`
              )
            );
          } else {
            const result = body ? JSON.parse(body) : {};
            resolve(result as T);
          }
        } catch (error) {
          reject(new Error(`Failed to parse GitHub API response: ${error}`));
        }
      });
    });

    request.on('error', (error) => {
      AppLogger.error(`GitHub API request failed: ${error.message}`);
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
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; scope: string; token_type: string }> {
  const payload = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const options: GitHubRequestOptions = {
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
    const response = await makeGitHubRequest<{
      access_token: string;
      scope: string;
      token_type: string;
      error?: string;
    }>(options, payload);

    if (response.error) {
      throw new Error(`OAuth exchange failed: ${response.error}`);
    }

    AppLogger.debug('Successfully exchanged OAuth code for access token');
    return response;
  } catch (error) {
    AppLogger.error(`Failed to exchange OAuth code: ${error}`);
    throw error;
  }
}

/**
 * Get authenticated user information
 */
export async function getAuthenticatedUser(
  accessToken: string
): Promise<GitHubUser> {
  const options: GitHubRequestOptions = {
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
    const user = await makeGitHubRequest<GitHubUser>(options);
    AppLogger.debug(`Retrieved user info: ${user.login}`);
    return user;
  } catch (error) {
    AppLogger.error(`Failed to get user info: ${error}`);
    throw error;
  }
}

/**
 * Get user's email from GitHub (with proper scopes)
 */
export async function getUserEmail(
  accessToken: string
): Promise<string | null> {
  const options: GitHubRequestOptions = {
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
    const emails = await makeGitHubRequest<
      Array<{ email: string; primary: boolean; verified: boolean }>
    >(options);

    const primaryEmail = emails.find((e) => e.primary && e.verified);
    return primaryEmail?.email || null;
  } catch (error) {
    AppLogger.warn(`Failed to get user email: ${error}`);
    return null;
  }
}

/**
 * Get user's permission for a specific repository
 * Returns the user's permission level in the target repository
 */
export async function getRepositoryPermission(
  accessToken: string,
  owner: string,
  repo: string,
  username: string
): Promise<RepositoryPermissionResponse> {
  const options: GitHubRequestOptions = {
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
    const response = await makeGitHubRequest<RepositoryPermissionResponse>(
      options
    );

    AppLogger.debug(
      `Retrieved permission for ${username} in ${owner}/${repo}: ${response.permission}`
    );
    return response;
  } catch (error) {
    AppLogger.warn(
      `Failed to get repository permission for ${username} in ${owner}/${repo}: ${error}`
    );
    // If error (likely 404 or no access), return 'none' permission
    return { permission: 'none' };
  }
}

/**
 * Map GitHub permission to MonoDog role
 */
export function mapPermissionToRole(
  permission: RepositoryPermission
): MonoDogPermissionRole {
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
export function hasPermission(
  userPermission: RepositoryPermission,
  requiredPermission: RepositoryPermission
): boolean {
  const permissionHierarchy: Record<RepositoryPermission, number> = {
    admin: 4,
    maintain: 3,
    write: 2,
    read: 1,
    none: 0,
  };

  return (
    permissionHierarchy[userPermission] >= permissionHierarchy[requiredPermission]
  );
}

/**
 * Validate OAuth token is still valid
 */
export async function validateToken(
  accessToken: string
): Promise<boolean> {
  try {
    await getAuthenticatedUser(accessToken);
    return true;
  } catch (error) {
    AppLogger.warn(`Token validation failed: ${error}`);
    return false;
  }
}

/**
 * Generate OAuth authorization URL
 */
export function generateAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  state: string,
  scopes: string[] = ['read:user', 'user:email', 'repo']
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: scopes.join(','),
    allow_signup: 'true',
  });

  return `${GITHUB_OAUTH_BASE}/login/oauth/authorize?${params.toString()}`;
}
