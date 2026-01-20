---
sidebar_position: 5
title: Config Endpoint
---

# Config Endpoint

Access configuration files via REST API.

## Get Configuration Files

```bash
GET /api/config/files
```

Returns all configuration files found in the monorepo (tsconfig, eslintrc, etc.).

Response:
```json
{
  "success": true,
  "files": [
    {
      "id": "/packages/packageB/tsconfig.json",
      "name": "tsconfig.json",
      "path": "/packages/packageB/tsconfig.json",
      "type": "json",
      "content": "{\n  \"files\": [],\n  \"references\": [\n    { \"path\": \"./tsconfig.app.json\" },\n    { \"path\": \"./tsconfig.node.json\" }\n  ]\n}\n",
      "size": 119,
      "lastModified": "2020-12-05T08:59:38.762Z",
      "hasSecrets": false,
      "isEditable": true
    },
    {
      "id": "/packages/packageC/vite.config.ts",
      "name": "vite.config.ts",
      "path": "/packages/packageC/vite.config.ts",
      "type": "typescript",
      "content": "import { defineConfig } from 'vite';\n\nexport default defineConfig({\n  server: {\n    open: true,\n  },\n});\n",
      "size": 105,
      "lastModified": "2020-12-05T08:59:38.760Z",
      "hasSecrets": false,
      "isEditable": true
    },
    ...
  ]
}
```

## Update Configuration File

```bash
PUT /api/config/files/ID
```
ID is the path of configuration file.

Update content of the configuration file.

Response:
```json
{
  "success": true,
  "file":
    {
      "id": "/packages/packageB/tsconfig.json",
      "name": "tsconfig.json",
      "path": "/packages/packageB/tsconfig.json",
      "type": "json",
      "content": "{\n  \"files\": [],\n  \"references\": [\n    { \"path\": \"./tsconfig.app.json\" },\n    { \"path\": \"./tsconfig.node.json\" }\n  ]\n}\n",
      "size": 119,
      "lastModified": "2020-12-05T08:59:38.762Z",
      "hasSecrets": false,
      "isEditable": true
    },
  "message": "File saved successfully"
}
```
