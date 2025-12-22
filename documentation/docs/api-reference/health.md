---
sidebar_position: 3
title: Health Endpoint
---

# Health Endpoint

Access health metrics via REST API.

## Get All Package Health

```bash
GET /api/health/packages
```
Response:
```json
{
    "packages": [
        {
        "packageName": "package-name",
        "health": {
            "buildStatus": "success",
            "testCoverage": 0,
            "lintStatus": "unknown",
            "securityAudit": "unknown",
            "overallScore": 50
        },
        "isHealthy": false
        },
        ...
   ],
    "summary": {
    "total": 15,
    "healthy": 0,
    "unhealthy": 15,
    "averageScore": 42.33
    }
}
```

## Refresh Health Data

```bash
POST /api/health/refresh
```
Response:
```json
{
    "packages": [
        {
        "packageName": "package-name",
        "health": {
            "buildStatus": "success",
            "testCoverage": 0,
            "lintStatus": "unknown",
            "securityAudit": "unknown",
            "overallScore": 50
        },
        "isHealthy": false
        },
        ...
   ],
    "summary": {
    "total": 15,
    "healthy": 0,
    "unhealthy": 15,
    "averageScore": 42.33
    }
}
```
