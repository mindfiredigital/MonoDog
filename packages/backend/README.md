# @mindfiredigital/monodog

> A self-hosted monorepo management platform with a CLI, REST API server, and interactive dashboard for analyzing packages, dependencies, health metrics, CI/CD pipelines, and releases.

[![npm version](https://img.shields.io/npm/v/@mindfiredigital/monodog.svg)](https://www.npmjs.com/package/@mindfiredigital/monodog)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@mindfiredigital/monodog` is the core backend package of the MonoDog ecosystem. It provides a CLI tool for initializing and serving the MonoDog environment, an Express.js REST API for monorepo analytics, and a static file server that hosts the `@mindfiredigital/monodog-dashboard` UI. It uses Prisma ORM with SQLite for persistent storage and integrates with GitHub OAuth and GitHub Actions for CI/CD management.

---

## Technology Stack

| Component | Technology | Description |
| --- | --- | --- |
| **Runtime** | Node.js 18+ | Server-side JavaScript execution |
| **Framework** | Express.js | HTTP server and API routing |
| **ORM** | Prisma | Type-safe database access with SQLite |
| **Auth** | GitHub OAuth | Authentication and RBAC |
| **Scanner** | @mindfiredigital/monorepo-scanner | Core monorepo analysis engine |
| **Utilities** | @mindfiredigital/utils | Shared types and algorithms |
| **API Docs** | Swagger (swagger-jsdoc + swagger-ui-express) | Auto-generated REST API documentation |
| **Security** | Helmet + express-rate-limit | HTTP security headers and rate limiting |

---

## Features

### CLI Tool (`monodog-cli`)
- **One-Command Initialization:** `pnpm dlx @mindfiredigital/monodog` scaffolds a complete MonoDog workspace inside any monorepo with `.env`, Prisma schema, database migrations, and configuration files.
- **Server Launch:** `monodog-cli --serve --root /path/to/monorepo` starts both the API server and dashboard UI server.
- **Configurable Ports:** `--port` flag and `monodog-config.json` for customizing API and dashboard ports.
- **Workspace Registration:** Automatically registers `monodog` inside `pnpm-workspace.yaml` during initialization.

### REST API Server (Express.js)
- **Package Endpoints:** `GET /api/packages`, `GET /api/packages/refresh`, `GET /api/packages/:name` for listing, refreshing, and viewing individual package details.
- **Health Endpoints:** `GET /api/health/packages`, `GET /api/health/refresh` for viewing and recalculating health metrics.
- **Commits Endpoint:** `GET /api/commits/:packagePath` for retrieving Git commit history per package.
- **Config Endpoint:** `GET /api/config/files` for scanning configuration files across the monorepo.
- **CI Endpoints:** `GET /api/ci/status`, `GET /api/ci/branches`, `POST /api/ci/trigger` for viewing GitHub Actions workflow runs, fetching remote branches, and manually triggering workflows.
- **Pipeline Endpoints:** CRUD operations for managing release pipelines filtered by repository owner.
- **Publish Endpoints:** Changeset creation, version bumping, and automated publishing via GitHub Actions.
- **Auth Endpoints:** GitHub OAuth login flow with access token encryption and role-based permission mapping.
- **Changelog Endpoints:** Local changelog parsing and GitHub Releases API integration.
- **Search Endpoint:** Full-text search across package names, descriptions, and metadata.
- **Swagger Documentation:** Auto-generated API documentation at `/api-docs` with comprehensive endpoint definitions.

### Authentication & Authorization
- **GitHub OAuth Flow:** Secure login via GitHub OAuth with encrypted access token storage.
- **RBAC (Role-Based Access Control):** Maps GitHub collaborator permissions (`admin`, `write`, `read`) to MonoDog roles with middleware enforcement.
- **Public Repository Fallback:** Automatically grants `read` access for public repositories when the user is not a direct collaborator.
- **Token Encryption:** AES-256-CBC encryption for storing GitHub access tokens at rest.

### Monorepo Analysis
- **Package Discovery:** Uses `@mindfiredigital/monorepo-scanner` to discover all workspace packages via `pnpm-workspace.yaml` glob patterns.
- **Health Scoring:** Weighted health score (0-100) computed from build status, test coverage, lint results, and security audit.
- **Dependency Graph:** Generates directed graph data of internal workspace dependencies for React Flow visualization.
- **Circular Dependency Detection:** DFS-based detection of circular dependency chains.
- **Security Audit:** Parses `pnpm audit --json` output with fallback handling for non-zero exit codes and missing `total` fields.

### CI/CD Integration
- **GitHub Actions Status Polling:** Fetches workflow run statuses from GitHub API with real-time dashboard updates.
- **Remote Branch Fetching:** Lists all remote branches via GitHub REST API for target branch selection during manual workflow dispatches.
- **Workflow Dispatch Trigger:** Triggers `workflow_dispatch` events on GitHub Actions from the dashboard UI.
- **Pipeline History:** Stores and displays release pipeline history filtered by repository `owner/repo`.

### Release Management
- **Changeset Generation:** Creates `.changeset/*.md` files with semantic version bump instructions (`patch`, `minor`, `major`) per package.
- **Automated Git Commits:** Stages and commits generated changeset files with `--no-verify` flag to bypass pre-commit hooks.
- **Scheduled Releases:** Worker-based scheduled release execution with GitHub PR creation.
- **npm Sync Worker:** Background worker for syncing package metadata with the npm registry.

### Security & Performance
- **Rate Limiting:** Express rate limiting middleware (`express-rate-limit`) for API protection.
- **Helmet Security Headers:** HTTP security headers via `helmet`.
- **CORS Configuration:** Configurable cross-origin resource sharing.
- **Request Logging:** HTTP request logging via `morgan`.

### Database
- **Prisma ORM:** Type-safe database access with auto-generated client.
- **SQLite Storage:** Zero-configuration local database for package metadata, health records, and pipeline history.
- **Automatic Migrations:** Prisma Migrate for schema evolution.

---

## Installation & Usage

### Quick Start (For Any Monorepo)

```bash
# Initialize MonoDog in your monorepo root
pnpm dlx @mindfiredigital/monodog

# Configure GitHub OAuth credentials
# Edit monodog/.env with your GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET

# Install dependencies
pnpm install

# Start MonoDog
cd monodog
pnpm run build
pnpm run serve
```

### Access Points

| Service | URL | Description |
| --- | --- | --- |
| **Dashboard UI** | `http://localhost:3010` | Interactive monorepo management dashboard |
| **API Server** | `http://localhost:4000` | REST API for monorepo analytics |
| **Swagger Docs** | `http://localhost:4000/api-docs` | Auto-generated API documentation |

### CLI Options

```bash
monodog-cli [options]

Options:
  --serve            Start the API server and dashboard
  --root <path>      Specify the monorepo root directory (default: cwd)
  --port <number>    Specify the API server port (default: 4000)
  -h, --help         Show help message
```

---

## Configuration

MonoDog uses a `monodog-config.json` file in the workspace root:

```json
{
  "workspace": {
    "root_dir": "../",
    "install_path": "packages"
  },
  "database": {
    "path": "./monodog.db"
  },
  "dashboard": {
    "host": "0.0.0.0",
    "port": "3010"
  },
  "server": {
    "host": "0.0.0.0",
    "port": 4000
  }
}
```

---
