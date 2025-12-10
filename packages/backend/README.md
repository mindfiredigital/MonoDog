# Monodog: Monorepo Analytics and Health API

## 🎯 Overview

This is the backend service designed to provide comprehensive analytics, health monitoring, and dependency tracking for a large **JavaScript/TypeScript monorepo**.
It leverages specialized **@monodog** tools and a database layer (via **Prisma**) to efficiently manage, persist, and expose data about all packages within the repository.

This service is typically run locally or on a central server to power a dedicated frontend dashboard.

---

## 🛠 Technology Stack

| Component      | Technology                | Description                                                          |
| -------------- | ------------------------- | -------------------------------------------------------------------- |
| **Language**   | TypeScript & Node.js      | Core language for runtime execution.                                 |
| **Framework**  | Express.js                | Handles all API routing and middleware.                              |
| **ORM**        | Prisma                    | Database layer for managing package and health status records.       |
| **Scanning**   | @monodog/monorepo-scanner | Core logic for file system scanning and package metadata extraction. |
| **VCS**        | GitService                | Used to fetch and analyze commit history per package path.           |
| **Networking** | cors, body-parser         | Essential middleware for API connectivity.                           |

---

## ⚙️ Prerequisites

You must have the following installed to run the service:

- **Node.js:** Version 18+ recommended
- **Package Manager:** `pnpm` or `npm` (use the one your monorepo uses)
- **Database:** A running instance of a database supported by Prisma (e.g., PostgreSQL, SQLite, MySQL)

---

## 🚀 Getting Started

### Installation

Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/lakinmindfire/MonoDog.git
cd packages/backend

# Install dependencies
pnpm install

# Database Setup (Prisma)

The application requires the database schema to be set up using **Prisma Migrate**.

pnpm prisma generate

pnpm prisma migrate dev

### Run backend server on port 4000 (default)

pnpm monodog-cli --serve --root .
```

### Key API Endpoints

| Method  | Route                       | Purpose                                                                                 | Persistence         |
| ------- | --------------------------- | --------------------------------------------------------------------------------------- | ------------------- |
| **GET** | `/api/packages`             | Retrieve all package metadata from the database.                                        | Cached / Persistent |
| **GET** | `/api/packages/refresh`     | Trigger a full file scan of the monorepo and update/sync the database.                  | Triggers write      |
| **GET** | `/api/packages/:name`       | Get detailed info, reports, and CI status for a package.                                | Cached / Persistent |
| **GET** | `/api/health/packages`      | Fetch the latest health metrics (score, build status) for all packages.                 | Persistent          |
| **GET** | `/api/health/refresh`       | Recalculate all package health metrics (tests, lint, security) and update the database. | Triggers write      |
| **GET** | `/api/commits/:packagePath` | Fetch Git commit history for a specific package directory.                              | Generated runtime   |
| **GET** | `/api/config/files`         | Scan the monorepo for essential configuration files (e.g., `tsconfig`, `.eslintrc`).    | Generated runtime   |
