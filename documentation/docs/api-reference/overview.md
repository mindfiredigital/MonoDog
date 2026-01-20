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

## Next Steps

- [Packages Endpoint](/api-reference/packages)
- [Health Endpoint](/api-reference/health)
- [Commits Endpoint](/api-reference/commits)
- [Config Endpoint](/api-reference/config)
