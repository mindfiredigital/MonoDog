import crypto from 'crypto';

// In-memory state storage (in production, use session/cache)
const stateStore = new Map<string, { createdAt: number }>();

export const generateGithubAuthUrl = () => {
  const clientId = process.env.GITHUB_CLIENT_ID || 'your-github-client-id';

  const redirectUri =
    process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/auth/callback';

  const scope = 'user:email read:user';

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

export const decodeSessionToken = (token: string) => {
  return JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as any;
};
