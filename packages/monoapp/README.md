# Monodog: Monorepo Analytics and Health API

## Overview

The dashboard will provide visual management and monitoring capabilities for packages in monorepos using pnpm and turbo. It will be distributed as an npm package installable in any monorepo to auto-generate a web UI for package oversight.

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
| **Scanning**  | monorepo-scanner     | Core logic for file system scanning and package metadata extraction.                      |
| **VCS**       | GitService           | Used to fetch and analyze commit history per package path.                                |

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

