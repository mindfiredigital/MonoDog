---
sidebar_position: 2
title: Authentication Endpoint
---

# Authentication Endpoint

GitHub OAuth authentication and session management via REST API.


## Initiate Login

Start the GitHub OAuth authentication flow.

```bash
GET /api/auth/login
```

Query Parameters:
- `redirect` (optional) - URL to redirect after successful authentication

Response:
```json
{
  "success": true,
  "authUrl": "https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&scope=repo",
  "message": "Login initiated"
}
```

## Handle OAuth Callback

Process the OAuth callback from GitHub after user authorization.

```bash
GET /api/auth/callback
```

Query Parameters:
- `code` (required) - GitHub authorization code
- `state` (required) - CSRF protection state token
- `error` (optional) - Error code if authorization failed
- `error_description` (optional) - Error message from GitHub

Response (Success):
```json
{
  "success": true,
  "sessionToken": "token_xxxxx",
  "user": {
    "id": "12345",
    "username": "octocat",
    "email": "octocat@github.com"
  },
  "message": "Authentication successful"
}
```

Response (Error):
```json
{
  "success": false,
  "error": "access_denied",
  "message": "User denied access"
}
```

## Get Current User Session

Retrieve the authenticated user's profile and permissions.

```bash
GET /api/auth/me
```

Headers:
- `Authorization: Bearer <sessionToken>` (required)

**In Swagger UI:** Click "Authorize" button and enter your session token

Response:
```json
{
  "success": true,
  "user": {
    "id": "12345",
    "username": "octocat",
    "email": "octocat@github.com"
  },
  "permissions": ["read:repo", "write:repo"]
}
```

## Validate Session

Check if the current session is still valid.

```bash
POST /api/auth/validate
```

Headers:
- `Authorization: Bearer <sessionToken>` (required)

**In Swagger UI:** Click "Authorize" button and enter your session token

Response:
```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "12345",
    "username": "octocat"
  },
  "message": "Session is valid"
}
```

## Refresh Session

Extend the session expiration time and get a new token.

```bash
POST /api/auth/refresh
```

Headers:
- `Authorization: Bearer <sessionToken>` (required)

**In Swagger UI:** Click "Authorize" button and enter your session token

Response:
```json
{
  "success": true,
  "sessionToken": "new_token_yyyyy",
  "expiresAt": "2026-03-06T15:30:00Z",
  "message": "Session refreshed"
}
```

## Logout

Invalidate the current user session.

```bash
POST /api/auth/logout
```

Headers:
- `Authorization: Bearer <sessionToken>` (optional)

Response:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Error Responses

| Status Code | Error | Message |
|---|---|---|
| 400 | MISSING_PARAMETERS | Missing authorization code or state |
| 400 | INVALID_STATE | CSRF validation failed |
| 401 | UNAUTHORIZED | Authentication token required |
| 401 | INVALID_OR_EXPIRED_SESSION | Session no longer valid |
| 500 | GITHUB_OAUTH_FAILED | OAuth authentication failed |

