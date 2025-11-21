# Monodog: Monorepo Analytics and Health API

## 🎯 Overview

The dashboard will provide visual management and monitoring capabilities for packages in monorepos using pnpm, turbo, or Nx. It will be distributed as an npm package installable in any monorepo to auto-generate a web UI for package oversight.

This service is typically run locally or on a central server and power a dedicated frontend dashboard.

---

## 🛠 Technology Stack

| Component | Technology | Description |
|------------|-------------|--------------|
| **Language** | TypeScript & Node.js | Core language for runtime execution. |
| **Framework** | Express.js, React | Express Handles all API routing and middleware and React for building the user interface.|
| **Styling** | Tailwind CSS | Utility-first framework for responsive, modern, and aesthetic design. |
| **ORM** | Prisma | Database layer for managing package and health status records. |
| **Scanning** | monorepo-scanner | Core logic for file system scanning and package metadata extraction. |
| **VCS** | GitService | Used to fetch and analyze commit history per package path. |

---

## ⚙️ Prerequisites

You must have the following installed to run the service:

- **Node.js:** Version 18+ recommended
- **Package Manager:** `pnpm` or `npm` (use the one your monorepo uses)

---

## 🚀 Getting Started

### Install Package in Monorepo

Install monoapp in a monorepo workspace root:

    pnpm install --save-dev @monodog/monoapp -w

Run app using serve script:

    npm --workspace @monodog/monoapp run serve

### Key API Endpoints

| Method | Route | Purpose | Persistence |
|--------|--------|----------|-------------|
| **GET** | `/api/packages` | Retrieve all package metadata from the database. | Cached / Persistent |
| **GET** | `/api/packages/refresh` | Trigger a full file scan of the monorepo and update/sync the database. | Triggers write |
| **GET** | `/api/packages/:name` | Get detailed info, reports, and CI status for a package. | Cached / Persistent |
| **GET** | `/api/health/packages` | Fetch the latest health metrics (score, build status) for all packages. | Persistent |
| **GET** | `/api/health/refresh` | Recalculate all package health metrics (tests, lint, security) and update the database. | Triggers write |
| **GET** | `/api/commits/:packagePath` | Fetch Git commit history for a specific package directory. | Generated runtime |
| **GET** | `/api/config/files` | Scan the monorepo for essential configuration files (e.g., `tsconfig`, `.eslintrc`). | Generated runtime |
