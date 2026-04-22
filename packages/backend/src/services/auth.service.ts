import crypto from 'crypto';
import { AUTH_ERRORS, STATE_EXPIRY } from '../constants';
import { AuthSession, OAuthCallbackResponse } from '../types';
import {
  exchangeCodeForToken,
  getAuthenticatedUser,
} from './github-oauth-service';
import { getRepositoryInfoFromGit } from '../utils/utilities';
import { AppLogger } from '../middleware';
import { getUserRepositoryPermission } from './permission-service';
import { storeSession } from '../middleware/auth-middleware';

const stateStore = new Map<
  string,
  { createdAt: number; redirectUrl?: string | undefined }
>();

export const generateGithubAuthUrl = () => {
  const clientId = process.env.GITHUB_CLIENT_ID || 'your-github-client-id';

  const redirectUri =
    process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/auth/callback';

  const scope = 'user:email read:user repo';

  const state = crypto.randomBytes(16).toString('hex');

  stateStore.set(state, { createdAt: Date.now() });

  for (const [key, value] of stateStore.entries()) {
    if (Date.now() - value.createdAt > 10 * 60 * 1000) {
      stateStore.delete(key);
    }
  }

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}&state=${state}`;

  return {
    authUrl,
    state,
  };
};

export const exchangeGithubCodeForToken = async (
  code: string,
  state: string,
  cookieState: string
) => {
  if (!code) {
    throw new Error('Authorization code is required');
  }

  if (!state || !cookieState) {
    throw new Error('State parameter is missing');
  }

  if (state !== cookieState || !stateStore.has(state)) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }

  stateStore.delete(state);

  const clientId = process.env.GITHUB_CLIENT_ID || 'your-github-client-id';

  const clientSecret =
    process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret';

  const tokenResponse = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    }
  );

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
  };

  if (tokenData.error || !tokenData.access_token) {
    throw new Error('Failed to exchange authorization code');
  }

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'User-Agent': 'MonoDog',
    },
  });

  const userData = (await userResponse.json()) as any;

  if (!userData.id) {
    throw new Error('Failed to fetch user information');
  }

  const sessionToken = Buffer.from(
    JSON.stringify({
      userId: userData.id,
      login: userData.login,
      token: tokenData.access_token,
      issuedAt: Date.now(),
    })
  ).toString('base64');

  return {
    sessionToken,
    user: {
      id: userData.id,
      login: userData.login,
      avatar_url: userData.avatar_url,
      name: userData.name,
      email: userData.email,
    },
  };
};

function validateState(state: string): boolean {
  const entry = stateStore.get(state);

  if (!entry) {
    return false;
  }

  // Check if state has expired
  if (Date.now() - entry.createdAt > STATE_EXPIRY) {
    stateStore.delete(state);
    return false;
  }

  return true;
}

function getRedirectUrl(state: string): string | undefined {
  const entry = stateStore.get(state);
  return entry?.redirectUrl;
}

function clearState(state: string): void {
  stateStore.delete(state);
}

export async function handleOAuthCallback(
  code: string,
  state: string
): Promise<OAuthCallbackResponse> {
  // Validate code and state
  if (!code || !state) {
    throw new Error(AUTH_ERRORS.MISSING_CODE_OR_STATE);
  }

  // Validate state for CSRF protection
  if (!validateState(state)) {
    throw new Error(AUTH_ERRORS.INVALID_OR_EXPIRED_SESSION);
  }

  if (!process.env.GITHUB_CLIENT_SECRET) {
    throw new Error(AUTH_ERRORS.LOGIN_INITIATION_FAILED);
  }

  // Exchange code for access token

  const tokenResponse = await exchangeCodeForToken(
    code,
    process.env.GITHUB_CLIENT_ID as string,
    process.env.GITHUB_CLIENT_SECRET as string,
    process.env.OAUTH_REDIRECT_URI as string
  );

  // Get user information

  const user = await getAuthenticatedUser(tokenResponse.access_token);

  // Fetch user's repository permission
  let permission = null;
  try {
    // Extract repository info from git remote
    const repoInfo = await getRepositoryInfoFromGit();

    if (!repoInfo) {
      AppLogger.warn(
        'Could not extract repository info from git remote - permission fetch skipped'
      );
    } else {
      const { owner, repo } = repoInfo;
      permission = await getUserRepositoryPermission(
        tokenResponse.access_token,
        user.id,
        user.login,
        owner,
        repo
      );
      AppLogger.info(
        `User ${user.login} has ${permission.permission} permission on ${owner}/${repo}`
      );
    }
  } catch (permError) {
    AppLogger.error(`Failed to fetch repository permission: ${permError}`);
    permission = null;
  }

  // Create session with permission
  const session: AuthSession = {
    accessToken: tokenResponse.access_token,
    expiresIn: 3600, // 1 hour default
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    user,
    scopes: tokenResponse.scope.split(','),
    permission, // Include fetched permission in session
  };

  // Store session and get token
  const permissionData = permission
    ? {
        level: permission.permission,
        role: permission.role,
        owner: permission.owner,
        repo: permission.repo,
      }
    : null;

  const sessionToken = storeSession(session);

  // Get redirect URL
  const redirectUrl = getRedirectUrl(state) || '/';

  // Clear state
  clearState(state);

  AppLogger.info(
    `User authenticated: ${user.login} with permission: ${permission?.permission || 'unknown'}`
  );

  return {
    sessionToken,
    redirectUrl,
    user: {
      id: user.id,
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
    },
    permission: permissionData,
  };
}

export const decodeSessionToken = (token: string) => {
  return JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as any;
};
