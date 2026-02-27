---
sidebar_position: 6
title: Publish Endpoint
---

# Publish Endpoint

Manage package publishing, changesets, and release pipelines via REST API.

## Get Packages for Publishing

```bash
GET /api/publish/packages
```

Response:
```json
{
  "success": true,
  "packages": [
    {
      "name": "@org/package-name",
      "path": "packages/package-name",
      "version": "1.0.0",
      "private": false,
      "dependencies": {},
      "devDependencies": {}
    }
  ],
  "total": 5
}
```

## Get Existing Changesets

```bash
GET /api/publish/changesets
```

Response:
```json
{
  "success": true,
  "changesets": [
    {
      "id": "changeset-1",
      "packages": ["@org/package-a", "@org/package-b"],
      "summary": "Add new feature with proper implementation",
      "author": "username",
      "createdAt": "2026-02-28T10:00:00Z"
    }
  ],
  "total": 1
}
```

## Create a Changeset

```bash
POST /api/publish/changesets
```

Request:
```json
{
  "packages": ["@org/package-a", "@org/package-b"],
  "bumps": [
    { "package": "@org/package-a", "bumpType": "minor" },
    { "package": "@org/package-b", "bumpType": "patch" }
  ],
  "summary": "Add new feature with proper implementation"
}
```

Response:
```json
{
  "success": true,
  "changeset": {
    "id": "changeset-1",
    "packages": ["@org/package-a", "@org/package-b"],
    "summary": "Add new feature with proper implementation",
    "author": "username",
    "createdAt": "2026-02-28T10:00:00Z"
  },
  "message": "Changeset created successfully"
}
```

## Preview Publish Plan

```bash
POST /api/publish/preview
```

Request:
```json
{
  "packages": ["@org/package-a"],
  "bumps": [
    { "package": "@org/package-a", "bumpType": "minor" }
  ],
  "summary": "changeset description"
}
```

Response:
```json
{
  "success": true,
  "isValid": true,
  "errors": [],
  "warnings": [],
  "checks": {
    "permissions": true,
    "workingTreeClean": true,
    "ciPassing": true,
    "versionAvailable": true
  },
  "preview": {
    "packages": [
      {
        "package": "@org/package-a",
        "oldVersion": "1.0.0",
        "newVersion": "1.1.0",
        "bumpType": "minor"
      }
    ],
    "workingTreeClean": true,
    "existingChangesets": 1,
    "affectedPackages": 1
  }
}
```

## Check Publish Status

```bash
GET /api/publish/status
```

Response:
```json
{
  "success": true,
  "status": {
    "workingTreeClean": true,
    "hasChangesets": true,
    "changesetCount": 1,
    "readyToPublish": true
  }
}
```

## Trigger Publishing Workflow

```bash
POST /api/publish/trigger
```

Request (optional):
```json
{
  "packages": [
    {
      "name": "@org/package-a",
      "newVersion": "1.1.0",
      "bumpType": "minor"
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "message": "Publishing workflow has been initiated",
  "result": {
      "timestamp": "2026-02-27T20:52:25.704Z"
  }
}
```
