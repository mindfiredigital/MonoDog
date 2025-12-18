---
sidebar_position: 3
title: Quick Start
---

# Quick Start Guide

Monodog can be started working within your monorepo in less than 5 minutes.

## Step 1: Install Monodog

In your monorepo root directory, run:

```bash
pnpm install --save-dev @mindfiredigital/monodog -w
```
If the 'monodog' folder is not created in the ptoject root by the postinstall script, you can try this:

```bash
pnpm store prune
```
The unreferenced packages which are not used by any project will be removed by this command. So, now install again using the command above.

## Step 2: Start the Server

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

## Step 3: Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3010
```

You should see the Monodog dashboard with:
- All packages in your monorepo
- Health status for each package
- Dependency visualization
- Build <!-- and test --> status

## Step 4: Explore the API

The REST API is available at `http://localhost:8999/api`

Try these endpoints:
```bash
# Get all packages
curl http://localhost:8999/api/packages

# Get package health metrics
curl http://localhost:8999/api/health/packages

# Refresh package data
curl http://localhost:8999/api/packages/refresh

# Get package details
curl http://localhost:8999/api/packages/{packageName}
```

## What's Next?

If Monodog is installed, you can explore:

<!-- ### Usage
- [Available Commands](/usage/commands)
- [Dashboard Guide](/usage/dashboard)
- [Examples](/usage/examples) -->

### Features
- [Package Scanning](/features/package-scanning)
- [Health Monitoring](/features/health-monitoring)
<!-- - [CI Integration](/features/ci-integration) -->

### API
- [Complete API Reference](/api-reference/overview)
- [Packages Endpoint](/api-reference/packages)
- [Health Endpoint](/api-reference/health)

## Troubleshooting

### Port 3010 Already in Use

If port 3010 is already in use, specify a different port in monodog-conf.json:
```
  "dashboard": {
    "port": 3011
  }
```
If port 8999 is already in use, specify a different port in monodog-conf.json:
```
  "server": {
    "port": 8990
  }
```

### Packages Not Appearing

Ensure that your monorepo structure is detected by the system:
```bash
# Verify workspace configuration
cat pnpm-workspace.yaml
```

## Next Steps

Want to know more? Just take a look at the [Installation Guide](/installation/install-npm) for full instructions on how to set up!
