---
sidebar_position: 1
title: API Overview
---

# API Reference Overview

Monodog has a complete REST API that lets developers access all monorepo data using the HTTP protocol.

## Base URL

```
http://localhost:8999/api
```

## Endpoints

### Authentication
- `GET /auth/login` - Initiate GitHub OAuth login
- `GET /auth/callback` - Handle OAuth callback
- `GET /auth/me` - Get current user session
- `POST /auth/validate` - Validate session
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh session

### Packages
- `GET /packages` - List all packages
- `GET /packages/{NAME}` - Get package details
- `POST /packages/refresh` - Refresh package data

### Health
- `GET /health/packages` - Get health metrics for all packages
- `POST /health/refresh` - Refresh health data

### Commits
- `GET /commits/{PACKAGE_PATH}` - Get commit history

### Config
- `GET /config/files` - Get configuration files
- `PUT /config/files/{ID}` - Get configuration files

### Publish/Release
- `GET /publish/packages` - Get all packages available for publishing
- `GET /publish/changesets` - Get existing unpublished changesets
- `POST /publish/changesets` - Create a new changeset
- `POST /publish/preview` - Preview the publish plan
- `GET /publish/status` - Check publish readiness
- `POST /publish/trigger` - Trigger the publishing workflow

## Next Steps

- [Authentication Endpoint](/api-reference/authentication)
- [Packages Endpoint](/api-reference/packages)
- [Health Endpoint](/api-reference/health)
- [Commits Endpoint](/api-reference/commits)
- [Config Endpoint](/api-reference/config)
- [Publish/Release Endpoint](/api-reference/publish)
