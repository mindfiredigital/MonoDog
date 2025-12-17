---
sidebar_position: 2
title: Configure Monorepo
---

# Configuring Your Monorepo for Monodog

Once Monodog is installed, configure it for your monorepo setup.

## Supported Workspace Types

Monodog supports all major monorepo tools:

### pnpm Workspaces (Recommended)

If using pnpm workspaces, Monodog will auto-detect:

**pnpm-workspace.yaml**:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'libs/*'
```

Monodog will automatically detect and work with this setup.

## Package Structure Requirements

Monodog expects packages to follow this structure:

```
my-package/
├── package.json          # Required
├── src/                  # Optional
├── dist/                 # Optional (build output)
├── __tests__/            # Optional
└── README.md             # Optional (read for docs)
```

### Required: package.json

Each package **must** have a `package.json`:

```json
{
  "name": "@scope/package3",
  "path": "packages/package",
  "version": "1.0.0",
  "description": "Package description",
  "private": false,
  "license": "MIT",
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "lint": "eslint ."
  },
  "dependencies": {
    "@scope/package2": "workspace:*"
  },
  "devDependencies": {
    "@vue/test-utils": "^2.4.0",
    "@vitest/coverage-v8": "^0.34.0",
  },
  "peerDependencies": {
    "vue": ">=3.0.0"
  }
}
```


## Configuring Package Metadata

### Add Package Descriptions

Update each `package.json` with meaningful descriptions:

```json
{
  "name": "@myorg/utils",
  "description": "Shared utility functions for all packages",
  "keywords": ["utilities", "helpers"],
  "author": "Your Name",
  "license": "MIT"
}
```

### Configure Dependencies

Ensure your `package.json` includes:

- `"dependencies"`: Production dependencies
- `"devDependencies"`: Development tools
- `"peerDependencies"`: Peer dependencies

### Configure Scripts

Monodog uses these common scripts (optional but recommended):

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### Custom Workspace Paths

In order to install node packages in non-default locations, you will then need to configure the `package.json` file accordingly:
```json
{
  "workspaces": [
    "apps/*",
    "packages/*",
    "libs/*"
  ],
}
```
### Configure Workspaces Scanning

In order to scan only limited workspaces, you will then need to configure the `monodog-conf.json` file accordingly:
```json
{
  "workspaces": [
    "packages/*",
    "libs/*"
  ],
}
```

## Testing Configuration

Please verify everything is in place:

```bash
# Run from your monorepo root
cd /path/to/monorepo/

# Check pnpm workspace
pnpm install

# Start Monodog
cd ./mindfiredigital-monodog/ && npm run serve

# In another terminal, check packages
curl http://localhost:8999/api/packages
```

You will see all the packages you have listed along with their metadata.

## Troubleshooting

### Packages Not Detected

Check your workspace configuration:
```bash
# For pnpm
cat pnpm-workspace.yaml


### Package Detection Issues

Verify package structure:
```bash
# Check if each package has package.json
find packages -name "package.json" -type f

```

## Next Steps

Once configured, proceed to:
1. [Environment Setup](/installation/environment-setup)
2. [First Run](/installation/first-run)
3. [Quick Start](/getting-started/quick-start)
