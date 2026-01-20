---
sidebar_position: 1
title: Introduction
# slug: /
---

## What is Monodog?

Monodog is a package available on npm. You can install it in your monorepo, and it will automatically:

- Scan and analyze all packages in your monorepo.
- Monitor package health metrics, such as <!-- tests, --> linting, and security.  <!-- - Integrate into CI/CD pipelines.  -->
- Analyze dependencies and relationships.

Monodog provides a REST API for access to all its features. It is already integrated directly into the Monodog dashboard for visual insights.
## Key Features

- **Automatically Discover and Analyze Packages** in Your Monorepo.
- **Monitoring Your Package Health** (build status, <!-- test coverage,--> linting score, and security audit).
- **Integration into CI** (any of GitHub Actions, GitLab CI, or anything else).
- **Understanding Package Dependencies and Relationships**.
- **Analyzing Git Commits**.
- **Full REST API** Access To All Data.

## Technology Stack

| Component     | Technology           |
|---|---|
| **Language**  | TypeScript and Node.js |
| **Framework** | Express.js           |
| **Database**  | Prisma ORM          |
| **Styling**   | Tailwind CSS         |
| **Frontend**  | React                |

## Requirements

- **Node.js**: v18 or higher
- **Package Manager**: pnpm
- **Monorepo Setup**: pnpm workspaces

## Quick Start

Install Monodog in your monorepo:

```bash
pnpm dlx @mindfiredigital/monodog
```
Go to the monodog directory that was created after the installation.

```bash
cd monodog
```

Run the dashboard and API:

```bash
pnpm serve
```

Visit the dashboard at http://localhost:3010 to begin monitoring your monorepo.

## Next Steps

- Learn about [Installation](/installation/install-npm).
- Explore [Getting Started](/getting-started/overview).
- Read the [API Reference](/api-reference/overview).
<!-- - Check out [Examples](/usage/examples). -->

## Support

- Read the full documentation.
- Report issues on [GitHub](https://github.com/mindfiredigital/monodog/issues).
- Discuss on [GitHub Discussions](https://github.com/mindfiredigital/monodog/discussions).
