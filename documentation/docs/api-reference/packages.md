---
sidebar_position: 2
title: Packages Endpoint
---

# Packages Endpoint

Access package information via REST API.

## List All Packages

```bash
GET /api/packages
```

Response:
```json
{
  "packages": [
     {
      "name": "package-name",
      "version": "1.0.3",
      "type": "lib",
      "createdAt": "2020-12-05T10:43:14.208Z",
      "lastUpdated": "2020-12-05T10:43:14.208Z",
      "dependencies": {
        "@org/package2": "workspace:*",
        "vue": "^3.5.21"
      },
      "maintainers": [],
      "path": "path-to-package",
      "description": "my package description",
      "license": "MIT",
      "repository": {
        "type": "git",
        "url": "http://github.com/reponame.git",
        "directory": "package/"
      },
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "build:check": "vue-tsc && vite build",
        "preview": "vite preview"
      },
      "devDependencies": {
        "@types/node": "^24.3.1",
        "@vitejs/plugin-vue": "^4.4.0",
        "typescript": "^5.7.2",
        "vite": "^4.4.5",
        "vue-tsc": "^2.0.29"
      },
      "peerDependencies": {

      }
    },
    ...
  ],
}
```

## Get Package Details

```bash
GET /api/packages/PACKAGE_NAME
```
PACKAGE_NAME is the name of package

Response:
```json
{
  "packages": [
     {
      "name": "package-name",
      "version": "1.0.3",
      "type": "lib",
      "createdAt": "2020-12-05T10:43:14.208Z",
      "lastUpdated": "2020-12-05T10:43:14.208Z",
      "dependencies": {
        "@org/package2": "workspace:*",
        "vue": "^3.5.21"
      },
      "maintainers": [],
      "path": "path-to-package",
      "description": "my package description",
      "license": "MIT",
      "repository": {
        "type": "git",
        "url": "http://github.com/reponame.git",
        "directory": "package/"
      },
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "build:check": "vue-tsc && vite build",
        "preview": "vite preview"
      },
      "devDependencies": {
        "@types/node": "^24.3.1",
        "@vitejs/plugin-vue": "^4.4.0",
        "typescript": "^5.7.2",
        "vite": "^4.4.5",
        "vue-tsc": "^2.0.29"
      },
      "peerDependencies": {

      },
      "dependenciesInfo": [
        {
          "name": "@org/package2",
          "packageName": "package2",
          "version": "workspace:^1.6.0",
          "type": "dependency",
          "status": "",
          "latest": "",
          "outdated": false
        },
        ...
      ],
      "commits": [
        {
          "author": "Dev A",
          "date": "2020-11-05T05:20:55.000Z",
          "hash": "8706247f68c0435a7ca314d20e87c6d566b86789",
          "message": "chore(release): version packages (#221)",
          "packageName": "@org/package2",
          "type": "chore"
        }
        ...
      ],
      "packageHealth": {
        "id": 11,
        "packageName": "package2",
        "packageOverallScore": 20,
        "packageBuildStatus": "unknown",
        "packageTestCoverage": 0,
        "packageLintStatus": "fail",
        "packageSecurity": "unknown",
        "packageDependencies": "",
        "createdAt": "2020-12-05T14:16:54.484Z",
        "updatedAt": "2020-12-09T14:35:49.183Z"
      },
      "successRate": 50,
      "averageDuration": 1050000,
      "lastCommit": "abc1234",
      "lastCommitDate": "2020-12-09T14:08:18.949Z",
      "branch": "main",
      "isHealthy": false,
      "issues": []
    },
    ...
  ],
}
```

## Update Package Configuration

```bash
PUT /api/packages/update-config
```
Response:
```json
{
  "success": true,
  "message": "Package configuration updated successfully",
     {
      "name": "package-name",
      "version": "1.0.3",
      "type": "lib",
      "createdAt": "2020-12-05T10:43:14.208Z",
      "lastUpdated": "2020-12-05T10:43:14.208Z",
      "dependencies": {
        "@org/package2": "workspace:*",
        "vue": "^3.5.21"
      },
      "maintainers": [],
      "path": "path-to-package",
      "description": "my package description",
      "license": "MIT",
      "repository": {
        "type": "git",
        "url": "http://github.com/reponame.git",
        "directory": "package/"
      },
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "build:check": "vue-tsc && vite build",
        "preview": "vite preview"
      },
      "devDependencies": {
        "@types/node": "^24.3.1",
        "@vitejs/plugin-vue": "^4.4.0",
        "typescript": "^5.7.2",
        "vite": "^4.4.5",
        "vue-tsc": "^2.0.29"
      },
      "peerDependencies": {

      }
    },
    "preservedFields": true
}
```


## Refresh Packages

```bash
POST /api/packages/refresh
```
Response:
```json
{
  "packages": [
     {
      "name": "package-name",
      "version": "1.0.3",
      "type": "lib",
      "createdAt": "2020-12-05T10:43:14.208Z",
      "lastUpdated": "2020-12-05T10:43:14.208Z",
      "dependencies": {
        "@org/package2": "workspace:*",
        "vue": "^3.5.21"
      },
      "maintainers": [],
      "path": "path-to-package",
      "description": "my package description",
      "license": "MIT",
      "repository": {
        "type": "git",
        "url": "http://github.com/reponame.git",
        "directory": "package/"
      },
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "build:check": "vue-tsc && vite build",
        "preview": "vite preview"
      },
      "devDependencies": {
        "@types/node": "^24.3.1",
        "@vitejs/plugin-vue": "^4.4.0",
        "typescript": "^5.7.2",
        "vite": "^4.4.5",
        "vue-tsc": "^2.0.29"
      },
      "peerDependencies": {

      }
    },
    ...
  ],
}
```
