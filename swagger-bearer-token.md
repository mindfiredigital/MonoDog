# Using Bearer Token in Swagger UI

## Overview
The MonoDog API includes protected endpoints that require authentication. The Swagger UI now provides an easy way to add your session token for testing authenticated endpoints.

## Protected Endpoints

The following endpoints require a Bearer token:
- **GET /auth/me** - Get current user session
- **POST /auth/validate** - Validate session
- **POST /auth/refresh** - Refresh session

## How to Add Token in Swagger

### Step 1: Get Your Session Token

First, you need to get a session token by completing the OAuth flow:

```bash
# 1. Start login
curl http://localhost:8999/api/auth/login

# 2. Copy the authUrl from response
# 3. Visit that URL and authorize with GitHub
# 4. GitHub will redirect to callback with code and state
# 5. Use the callback endpoint with code and state
curl "http://localhost:8999/api/auth/callback?code=CODE&state=STATE"

# Response will include sessionToken
```

### Step 2: Open Swagger UI

Navigate to:
```
http://localhost:8999/api-docs/
```

### Step 3: Authorize with Token

1. Look for the **"Authorize"** button in the top-right corner of Swagger UI (green button with lock icon)
2. Click the **"Authorize"** button
3. In the dialog, you'll see "BearerAuth" section
4. In the "Value" field, enter your session token:
   ```
   YOUR_SESSION_TOKEN
   ```
   (Just the token itself, NOT "Bearer YOUR_TOKEN" - Swagger handles the "Bearer" prefix automatically)

5. Click **"Authorize"**
6. You should see a confirmation that authorization was successful
7. Click **"Close"**

### Step 4: Test Protected Endpoints

Now you can test the protected endpoints:

1. Click on **"GET /auth/me"**
2. Click **"Try it out"**
3. Click **"Execute"**

The request will now include your Bearer token automatically!

```bash
# Behind the scenes, Swagger sends:
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  http://localhost:8999/api/auth/me
```

## Example Workflow

### 1. Initiate Login (Unprotected)
```
GET /auth/login
```
Response includes `authUrl`

### 2. Handle Callback (Unprotected)
```
GET /auth/callback?code=...&state=...
```
Response includes `sessionToken`

### 3. Get User Session (Protected )
```
GET /auth/me
```
**Now requires Bearer token in Swagger Authorize**

### 4. Validate Session (Protected )
```
POST /auth/validate
```
**Now requires Bearer token in Swagger Authorize**

### 5. Refresh Session (Protected )
```
POST /auth/refresh
```
**Now requires Bearer token in Swagger Authorize**

### 6. Logout (Optional Authentication)
```
POST /auth/logout
```
Works with or without Bearer token

## Swagger UI Security Features

 **Authorization Button** - Click to add your token once, applies to all protected endpoints
 **Bearer Scheme** - Uses standard HTTP Bearer authentication
 **Secure Testing** - Test protected endpoints without manual header manipulation
 **Clear Indicators** - Protected endpoints show lock icon in Swagger UI

## Troubleshooting

### "Unauthorized" Error
- Make sure you've clicked "Authorize" and added a valid token
- Check that your session token is correct
- The token might be expired - get a new one using /auth/callback

### Token Not Being Sent
- Verify you clicked "Authorize" successfully
- Look at the request in browser DevTools to see if Authorization header is present
- Try refreshing the Swagger UI page

### "Authentication token required" Error
- This means the Authorize button wasn't activated
- Click the Authorize button again and confirm it shows "Logout" option

## Advanced: Manual Token Testing

If you prefer manual testing without Swagger:

```bash
# Get token from callback
TOKEN=$(curl -s "http://localhost:8999/api/auth/callback?code=CODE&state=STATE" | jq -r '.sessionToken')

# Use token in requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8999/api/auth/me
```

## Security Notes

**Important:**
- Never share your session token
- The token is tied to your GitHub account
- Use `POST /auth/logout` to invalidate the token when done
- Tokens expire after a certain time - use `POST /auth/refresh` to extend
