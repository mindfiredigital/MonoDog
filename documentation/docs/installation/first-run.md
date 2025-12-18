---
sidebar_position: 4
title: First Run
---

# First Run - Getting Monodog Started

Once the installation and configuration are done, it's the moment to run Monodog for the first time.

## Server Startup

Go to the monodog directory that was created after the installation.

```bash
cd monodog
```

Run Monodog application:

```bash
npm run serve
```


You should see output like:

```
[monodog] Checking for monodog-conf.json
Starting Monodog API server...
Analyzing monorepo at root:
Serving static files from:
App listening on 0.0.0.0:3010
[Database] Total packages found: 15
🚀 Backend server running on http://0.0.0.0:8999
```

## Access the dashboard

To access the dashboard, simply open your browser and access this:

```
http://localhost:3010
```

## First-Time Checks

### 1. Verify Package Discovery

Check if all of the packages were discovered:

```bash
curl http://localhost:8999/api/packages
```

Expected response (partial):

```json
{
  "packages": [
      {
        "name":"package-name",
        "version": "1.0.3",
        "type": "lib",
        "createdAt": "2020-12-05T10:43:14.261Z",
        "lastUpdated": "2020-12-05T10:43:14.261Z",
        "dependencies": {
          "@mindfiredigital/pivothead-vue": "workspace:*",
          "vue": "^3.5.21"
        },
        "maintainers": [],
        "path": "/path-to-package",
        "description": "",
        "license": "",
        "repository": {

        },
        "scripts": {
          "dev": "vite",
          "build": "vite build",
          "build:check": "vue-tsc && vite build",
          "preview": "vite preview"
        },
        "status": "error",
        "devDependencies": {
          "@types/node": "^24.3.1",
          "@vitejs/plugin-vue": "^4.4.0",
          "typescript": "^5.7.2",
          "vite": "^4.4.5",
          "vue-tsc": "^2.0.29"
        },
        "peerDependencies": {
        }
      }
    ...
  ],
}
```

### 2. Check Health Status

**Get health metrics for all packages:**

```bash
curl http://localhost:8999/api/health/packages
```

This shows test coverage, lint status, and build heath for each package.

### 3. Verify Database

**Check that the database was created:**

```bash
ls -la monodog/prisma/monodog.db
```

You should see the SQLite database file.

## Initial Database Seeding

On first run, Monodog:

1. **Scans** your monorepo structure
2. **Analyzes** each package's metadata
3. **Runs** health checks (lint, builds)
4. **Stores** results in database
5. **Generates** dependency graph

This might take a few minutes depending on your monorepo size.

### Run on Custom Port

To run app on custom port update monodog-conf.json

````json
  "server": {
    "port": 8999
  }```

## What Happens After First Run

After the first run:

1. **Database** is populated
2. **Caches** are populated
3. **API** is ready for queries

Regular operations:

```bash
# Get package list (cached)
curl http://localhost:8999/api/packages

# Refresh data (recalculates)
curl http://localhost:8999/api/packages/refresh

# Get specific package
curl http://localhost:8999/api/packages/packagename

# Get health metrics
curl http://localhost:8999/api/health/packages
````

## Troubleshooting First Run

### Server Won't Start

```bash
# Check Node.js version
node --version  # Should be >= 18

# Check port is available
lsof -i :8999  # Should return nothing

# Go to the monodog directory
cd monodog

# Check dependencies installed
npm install --ignore-scripts

# Rebuild if needed
npm run build
```

### Packages Not Found

```bash
# Verify workspace config from monorepo root
cat pnpm-workspace.yaml

# Check packages for each workspace
find packages -name "package.json" | wc -l

```

### Database Error

```bash
# Remove and reinitialize database from monodog directory
rm monodog/prisma/monodog.db

npm install --ignore-scripts

npm run migrate:reset

# Restart server
npm run serve
```

## Next Steps

Since Monodog is operational now,

1. **Discover the Dashboard**: Look at all packages along with their metrics
2. **Test the API**: Use different endpoints
3. **Go through the Full Guide**: Get familiar with all features and functionalities
<!-- 4. **Configure Features**: Set up CI integration, custom rules -->

Continue with:

- [Dashboard Usage Guide](/usage/dashboard)
- [API Reference](/api-reference/overview)
