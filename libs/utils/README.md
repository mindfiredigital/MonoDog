# @mindfiredigital/utils

> Shared utility functions, type definitions, and core algorithms for the MonoDog monorepo dashboard ecosystem.

[![npm version](https://img.shields.io/npm/v/@mindfiredigital/utils.svg)](https://www.npmjs.com/package/@mindfiredigital/utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@mindfiredigital/utils` is the utility library used across all MonoDog packages. It provides core type definitions, monorepo scanning algorithms, dependency graph generation, circular dependency detection, health score computation, and package size analysis.

---

## Exported Functions

| Function                                               | Description                                                                 |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `scanMonorepo(rootDir)`                                | Discovers all packages inside `packages/`, `apps/`, and `libs/` directories |
| `generateMonorepoStats(packages)`                      | Computes aggregate statistics from an array of `PackageInfo` objects        |
| `findCircularDependencies(packages)`                   | Detects circular dependency chains using DFS traversal                      |
| `generateDependencyGraph(packages)`                    | Builds a `{ nodes, edges }` graph structure for visualization               |
| `checkOutdatedDependencies(pkg)`                       | Returns dependencies with range-based version specifiers                    |
| `getPackageSize(packagePath)`                          | Calculates total disk size and file count of a package                      |
| `calculatePackageHealth(build, coverage, lint, audit)` | Computes weighted health score (0-100)                                      |

---

## Features

- **Monorepo Scanning:** Recursively discovers packages inside `packages/`, `apps/`, and `libs/` directories by reading `package.json` files and classifying each package as `app`, `lib`, or `tool`.
- **Package Metadata Parsing:** Extracts name, version, description, license, scripts, dependencies, devDependencies, peerDependencies, and maintainers from each discovered package.
- **Dependency Graph Generation:** Builds a directed graph of internal workspace dependencies with nodes (packages) and edges (dependency links), ready for visualization.
- **Circular Dependency Detection:** Uses depth-first search (DFS) with a recursion stack to detect and report all circular dependency chains across workspace packages.
- **Outdated Dependency Detection:** Identifies packages with range-based version specifiers (`^`, `~`) that may be outdated and flags them for review.
- **Package Health Score Calculation:** Computes a weighted overall health score (0-100) based on four metrics:
  - **Build Status** (30 points): `success` / `running` / `failed` / `unknown`
  - **Test Coverage** (25 points): Percentage-based scoring from coverage reports
  - **Lint Status** (25 points): `pass` / `fail` / `unknown`
  - **Security Audit** (20 points): `pass` / `fail` / `unknown`
- **Monorepo Statistics:** Generates aggregate statistics including total packages, app/library/tool counts, healthy/warning/error package counts, and total dependency counts.
- **Package Size Analysis:** Calculates the total disk size and file count of a package directory (excluding `node_modules`, `dist`, `build`, and `.git`).

---

## Installation

```bash
pnpm add @mindfiredigital/utils
```

```bash
npm install @mindfiredigital/utils
```

---

## Usage

```typescript
import {
  scanMonorepo,
  generateMonorepoStats,
  findCircularDependencies,
  generateDependencyGraph,
  checkOutdatedDependencies,
  getPackageSize,
  calculatePackageHealth,
} from '@mindfiredigital/utils/helpers';

// Scan all packages in a monorepo
const packages = scanMonorepo('/path/to/monorepo');
console.log(`Found ${packages.length} packages`);

// Generate aggregate statistics
const stats = generateMonorepoStats(packages);
console.log(
  `Apps: ${stats.apps}, Libraries: ${stats.libraries}, Tools: ${stats.tools}`
);

// Build dependency graph for visualization
const graph = generateDependencyGraph(packages);
console.log(`Nodes: ${graph.nodes.length}, Edges: ${graph.edges.length}`);

// Detect circular dependencies
const cycles = findCircularDependencies(packages);
if (cycles.length > 0) {
  console.warn('Circular dependencies found:', cycles);
}

// Calculate health score for a package
const health = calculatePackageHealth('success', 85, 'pass', 'pass');
console.log(`Health Score: ${health.overallScore}/100`);

// Get package disk size
const size = getPackageSize('/path/to/package');
console.log(`Size: ${size.size} bytes, Files: ${size.files}`);

// Check for outdated dependencies in a package
const outdated = checkOutdatedDependencies(packages[0]);
console.log(`Outdated dependencies: ${outdated.length}`);
```

---

## Exported Types

| Type             | Description                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `PackageInfo`    | Complete metadata for a discovered package (name, version, type, path, dependencies, scripts, etc.) |
| `DependencyInfo` | Information about a single dependency (name, version, type, outdated status)                        |
| `PackageHealth`  | Health assessment result (buildStatus, testCoverage, lintStatus, securityAudit, overallScore)       |
| `MonorepoStats`  | Aggregate monorepo statistics (totalPackages, apps, libraries, tools, dependency counts)            |

---
