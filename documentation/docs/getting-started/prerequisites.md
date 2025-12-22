---
sidebar_position: 2
title: Prerequisites
---

# Prerequisites

Before you install Monodog, make sure your environment meets these requirements.

## System Requirements

### Node.js
- **Minimum Version**: v18.0.0
- **Recommended Version**: v18.17.0 or higher
- **LTS Versions**: v20.x or higher

Check your Node.js version:
```bash
node --version
```

### Package Manager
Monodog requires package manager:
- **pnpm**: v8.0.0 or higher *(Recommended)*

Check your package manager version:
```bash
# For pnpm
pnpm --version

```

## Monorepo Setup

Your project must be a monorepo using pnpm Workspaces


## Monorepo Structure

Your monorepo should have a standard structure:

```
my-monorepo/
├── package.json              (root workspace config)
├── pnpm-workspace.yaml       
├── packages/
│   ├── package-a/
│   ├── package-b/
│   └── package-c/
├── apps/
│   ├── web/
│   ├── mobile/
│   └── api/
└── libs/
    ├── shared-utils/
    └── constants/
```

## Required Workspace Files

Make sure your monorepo has:

1. **Root `package.json`** with workspace configuration
   ```json
   {
     "workspaces": ["packages/*"]
   }
   ```

2. **Workspace declaration file**
   - `pnpm-workspace.yaml` (for pnpm)

3. **Individual package.json** files in each package/app directory

## Optional but Recommended

- **Git Repository**: If your monorepo is in a git repository, Monodog can perform git history analysis.
- **CI/CD Setup**: Integration with Monodog's CI capabilities through GitHub Actions or GitLab CI.

## Verification Checklist

Before proceeding with installation, verify:

- [ ] node.js v18+ is installed: `node --version`
- [ ] A package manager is installed: `pnpm --version` (or npm)
- [ ] You have already navigated to the monorepo directory
- [ ] The root `package.json` is present
- [ ] There is a workspace configuration file (`pnpm-workspace.yaml`)
- [ ] Your monorepo contains multiple packages
- [ ] A Git repository is initialized (optional but recommended)

## Troubleshooting Prerequisites

### Node.js Version Issues
If you have an older Node.js version:
```bash
# Using nvm (Node Version Manager)
nvm install 18
nvm use 18
```

### Package Manager Not Found
```bash
# Install pnpm globally
npm install -g pnpm@latest

# Verify installation
pnpm --version
```

### Not in a Monorepo
If you're not sure if you're in a monorepo, check for:
```bash
# Look for workspace config
ls -la pnpm-workspace.yaml

# Check root package.json for workspaces field
cat package.json | grep -A 5 workspaces
```

## Next Steps

Having checked all the prerequisites, go to [Quick Start](/getting-started/quick-start) to start Monodog!

Or directly access [Installation](/installation/install-npm) for comprehensive setup guidelines.