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
 pnpm dlx @mindfiredigital/monodog
```

This will create a 'monodog' directory in project root and add monodog as a package in pnpm-workspace.yaml

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


## Next Steps

Once installed, proceed to:
1. [Configure Your Monorepo](/installation/configure-monorepo)
2. [Set Up Environment Variables](/installation/environment-setup)
3. [Run Your First Instance](/installation/first-run)

Or jump directly to [Quick Start](/getting-started/quick-start)!
