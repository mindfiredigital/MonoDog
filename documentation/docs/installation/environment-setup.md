---
sidebar_position: 3
title: Environment Setup
---

# Environment Variables

Before running MonoDog for the first time, you need to configure your environment variables. This allows MonoDog to communicate with your GitHub repositories securely.

Create a `.env` file inside the newly generated `monodog/` directory and provide the following values:

```bash
# GitHub OAuth Configuration
# Generate these from https://github.com/settings/developers (Create a new OAuth App)
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:4000/api/auth/callback

# CORS Configuration
# Note: The dashboard runs on port 3010 by default
CORS_ORIGINS=http://localhost:3010
```

### Obtaining GitHub OAuth Credentials

1. Go to your GitHub account **Settings** > **Developer Settings** > **OAuth Apps**.
2. Click **New OAuth App**.
3. Set the **Homepage URL** to `http://localhost:3010`.
4. Set the **Authorization callback URL** to `http://localhost:4000/api/auth/callback`.
5. Generate a new Client Secret and copy both the Client ID and Secret into your `.env` file.

## Next Steps

Once your `.env` files are configured, you are ready to start MonoDog!

1. [First Run](/installation/first-run)
2. [Quick Start](/getting-started/quick-start)
