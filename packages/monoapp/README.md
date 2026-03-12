# Monodog: Monorepo Analytics and Health API

## Overview

Monodog provides visual management and monitoring capabilities for packages in monorepos using pnpm and Turbo. It is distributed as an npm package that can be installed in any monorepo to automatically generate a web UI for package oversight.

This service is typically run locally or on a central server and power a dedicated frontend dashboard.
<img width="1593" height="807" alt="package-scan" src="https://github.com/user-attachments/assets/d7e86b80-9f6a-4608-9103-68e6d660cc36" />

---

## Technology Stack

| Component     | Technology           | Description                                                                               |
| ------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| **Language**  | TypeScript & Node.js | Core language for runtime execution.                                                      |
| **Framework** | Express.js, React    | Express Handles all API routing and middleware and React for building the user interface. |
| **Styling**   | Tailwind CSS         | Utility-first framework for responsive, modern, and aesthetic design.                     |
| **ORM**       | Prisma               | Database layer for managing package and health status records.                            |
|**VCS**       | Github           |  Handles secure auth, automates Changeset PRs, and monitors CI/CD status.                           |

---

## Prerequisites

You must have the following installed to run the service:

- **Node.js:** Version 18+ recommended
- **Package Manager:** `pnpm`

---

## Getting Started

### Install Package in Monorepo

Install monodog in a monorepo workspace root:

    pnpm dlx @mindfiredigital/monodog

Run app using serve script:

    cd ./monodog/ && npm run serve

### Key API Endpoints

| Method  | Route                       | Purpose                                                                                 | Persistence         |
| ------- | --------------------------- | --------------------------------------------------------------------------------------- | ------------------- |
| **GET** | `/api/packages`             | Retrieve all package metadata from the database.                                        | Persistent |
| **POST** | `/api/packages/refresh`     | Trigger a full file scan of the monorepo and update/sync the database.                  | Triggers write      |
| **GET** | `/api/packages/:name`       | Get detailed info, commits and health status for a package.                                | Persistent |
| **PUT** | `/api/packages/update-config`| Update configuration for a package.                                                       | Triggers write |
| **GET** | `/api/health/packages`      | Fetch the latest health metrics (score, build status) for all packages.                 | Persistent          |
| **POST** | `/api/health/refresh`       | Recalculate all package health metrics (build, lint, security) and update the database. | Triggers write      |
| **GET** | `/api/commits/:packagePath` | Fetch Git commit history for a specific package directory.                              | Persistent   |
| **GET** | `/api/config/files`         | Scan the monorepo for essential configuration files (e.g., `tsconfig`, `.eslintrc`).    | Generated runtime   |
| **PUT** | `/api/config/files/:id`      | Update a configuration files (e.g., `tsconfig`, `.eslintrc`).                          | Generated runtime   |
| **GET** | `/auth/login`               | Initiate GitHub OAuth 2.0 authentication flow. Redirects to GitHub for authorization.  | Session creation    |
| **GET** | `/auth/callback`            | Handle OAuth callback from GitHub with authorization code and validate state parameter. | Session persistence |
| **GET** | `/auth/me`                  | Retrieve authenticated user profile.                         | Persistent          |
| **GET** | `/auth/validate`            | Validate current session token status.                       | Persistent          |
| **GET** | `/auth/logout`              | Invalidate session and clear authentication token.                                      | Session termination |
| **POST** | `/auth/refresh`            | Extend session token validity period.                        | Session update      |
| **GET** | `/api/publish/packages`     | (Publish API) List workspace packages available for publishing.                        | Persistent         |
| **GET** | `/api/publish/changesets`   | Retrieve existing unpublished changesets.                                              | Persistent         |
| **POST** | `/api/publish/preview`      | Preview a publish plan (version bumps, affected packages).                            | Generated data     |
| **POST** | `/api/publish/changesets`   | Create a new changeset (write permission required).                                   | Triggers write     |
| **GET** | `/api/publish/status`       | Check readiness for publishing (clean tree, CI status, etc.).                        | Persistent         |
| **POST** | `/api/publish/trigger`      | Trigger a publishing workflow for selected packages.                                 | Triggers CI/CD     |
| **GET** | `/api/pipelines`            | (Pipelines API) Retrieve recent pipeline records used by the dashboard.               | Persistent         |
| **PUT** | `/api/pipelines/:pipelineId/status` | Update a pipeline's status from GitHub workflow.                                | Triggers write     |
| **GET** | `/api/pipelines/:pipelineId/audit-logs` | Retrieve audit history for a pipeline.  
| **GET** | `/api/workflows/:owner/:repo/available` | List workflows configured in a repo.                                         | Generated data     |
| **GET** | `/api/workflows/:owner/:repo` | Fetch recent workflow runs for a repo.                                             | Generated data     |
| **GET** | `/api/workflows/:owner/:repo/runs/:runId` | Get details (with jobs) for a specific run.                                  | Generated data     |
| **GET** | `/api/workflows/:owner/:repo/jobs/:jobId/logs` | Get raw job logs text.                                                   | Generated data     |
| **POST** | `/api/workflows/:owner/:repo/trigger` | Start a repository workflow run.                                               | Triggers workflow  |
| **POST** | `/api/workflows/:owner/:repo/runs/:runId/cancel` | Cancel an in-progress run.                                            | Triggers action    |
| **POST** | `/api/workflows/:owner/:repo/runs/:runId/rerun` | Rerun a completed workflow.                                              | Triggers action    |
                                      | Persistent         |
