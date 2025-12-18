---
sidebar_position: 1
title: NPM Installation
---

# Installing Monodog

This guide covers all the ways to install Monodog in your monorepo.

## Using pnpm (Recommended)

pnpm is the recommended package manager for Monodog installations.

### As a Dev Dependency (Workspace Level)

Install Monodog as a dev dependency in your workspace root:

```bash
pnpm install --save-dev @mindfiredigital/monodog -w
```

This makes Monodog available to all packages in your workspace.


### Verify Installation

Check that Monodog was installed correctly:

```bash
pnpm list @mindfiredigital/monodog
```

You should see output like:
```
devDependencies:
@mindfiredigital/monodog 1.0.0
```

## After Installation

Once installed, Monodog will automatically:

1. **Generate Prisma Files**: Database schema and migrations
2. **Initialize Database**: Create SQLite database (monodog.db)


## Viewing Installed Files

After installation, you'll have:

```
monodog/
├── dist/                    # Compiled JavaScript
├── monodog-dashboard/       # Frontend
│   ├── dist                 # Compiled JavaScript
├── src/                     # TypeScript source
├── node_modules/            # Dependencies
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── monodog.db          # SQLite database
├── package.json
└── tsconfig.json
```

## Troubleshooting Installation

### "monoapp-setup not found" Error

If you see an error about `monoapp-setup` not being found:

```bash
# Go to the monodog directory
cd monodog

# Check dependencies installed
npm install --ignore-scripts

# Rebuild
npm run build
```

### "Permission denied" Error

On Linux/Mac, ensure execution permissions in monorepo root:

```bash
chmod +x node_modules/.bin/monoapp-setup
```

### npm ERR! about workspace packages

Make sure you're using the `-w` or `-W` flag:

```bash
# pnpm
pnpm install --save-dev @mindfiredigital/monodog -w
```

## Next Steps

Once installed, proceed to:
1. [Configure Your Monorepo](/installation/configure-monorepo)
2. [Set Up Environment Variables](/installation/environment-setup)
3. [Run Your First Instance](/installation/first-run)

Or jump directly to [Quick Start](/getting-started/quick-start)!
