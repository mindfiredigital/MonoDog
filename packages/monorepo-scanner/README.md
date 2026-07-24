# @mindfiredigital/monorepo-scanner

> A comprehensive Node.js scanner for analyzing JavaScript/TypeScript monorepo packages, dependencies, health metrics, and Git history.

[![npm version](https://img.shields.io/npm/v/@mindfiredigital/monorepo-scanner.svg)](https://www.npmjs.com/package/@mindfiredigital/monorepo-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@mindfiredigital/monorepo-scanner` provides a high-level `MonorepoScanner` class that orchestrates full monorepo analysis. It combines package discovery, health assessments, Git metadata extraction, file type scanning, result caching, and multi-format export into a single, cohesive scanning engine.

---

## Features

### Package Discovery & Analysis

- **Automatic Package Detection:** Discovers all packages across `packages/`, `apps/`, and `libs/` directories by reading `package.json` manifests.
- **Package Type Classification:** Automatically classifies each package as `app`, `lib`, or `tool` based on scripts and keywords.
- **Dependency Graph Construction:** Maps internal workspace dependency relationships for visualization.
- **Circular Dependency Detection:** Identifies and reports circular dependency chains across the entire monorepo.
- **Outdated Dependency Identification:** Flags packages with potentially outdated dependencies.

### Health Assessment

- **Build Status Check:** Executes `npm run build` per package and reports `success`, `failed`, `running`, or `unknown`.
- **Test Coverage Analysis:** Reads coverage reports from multiple formats (`coverage-summary.json`, `lcov.info`, `clover.xml`) and calculates percentage scores.
- **Lint Status Validation:** Runs `npm run lint` per package and reports `pass`, `fail`, or `unknown`.
- **Security Audit Scanning:** Executes `pnpm audit --json` to scan for known vulnerabilities and reports `pass`, `fail`, or `unknown`.
- **Overall Health Score:** Computes a weighted score (0-100) combining build (30pts), tests (25pts), lint (25pts), and security (20pts).

### Git Integration

- **Last Commit Info:** Retrieves the latest commit hash, date, and author for each package.
- **Branch Detection:** Identifies the current active Git branch per package.
- **Last Modified Timestamp:** Reads the filesystem modification date for each package directory.

### File System Scanning

- **File Type Search:** Scans all packages for specific file extensions (e.g., `.ts`, `.tsx`, `.json`, `.yaml`) with automatic exclusion of `node_modules`, `dist`, `build`, and `.git` directories.

### Caching

- **In-Memory Cache:** Caches full scan results with a configurable 5-minute TTL to avoid redundant scans.
- **Cache Invalidation:** Provides a `clearCache()` method for manual cache clearing.

### Export & Reporting

- **JSON Export:** Serializes full scan results to formatted JSON.
- **CSV Export:** Generates CSV reports with package name, type, version, dependency count, and health score columns.
- **HTML Export:** Produces a self-contained HTML report with styled tables and summary statistics.

---

## Installation

```bash
pnpm add @mindfiredigital/monorepo-scanner
```

```bash
npm install @mindfiredigital/monorepo-scanner
```

---

## Usage

```typescript
import {
  quickScan,
  generateReports,
  scanForFiles,
} from '@mindfiredigital/monorepo-scanner';

// Full monorepo scan with caching
const result = await quickScan();
console.log(
  `Found ${result.packages.length} packages in ${result.scanDuration}ms`
);
console.log(`Circular dependencies: ${result.circularDependencies.length}`);

// Generate detailed per-package reports (includes health, size, git info)
const reports = await generateReports();
reports.forEach(report => {
  console.log(
    `${report.package.name}: Health Score ${report.health.overallScore}/100`
  );
});

// Scan for specific file types across all packages
const tsFiles = scanForFiles(['.ts', '.tsx']);
console.log(`Found ${tsFiles['.ts'].length} TypeScript files`);
```

### Class-Based Usage

```typescript
import { MonorepoScanner } from '@mindfiredigital/monorepo-scanner';

const scanner = new MonorepoScanner('/path/to/monorepo');

// Full scan
const result = await scanner.scan();

// Generate per-package reports
const reports = await scanner.generatePackageReports();

// Individual health checks
const buildStatus = await scanner.checkBuildStatus(result.packages[0]);
const testCoverage = await scanner.checkTestCoverage(result.packages[0]);
const lintStatus = await scanner.checkLintStatus(result.packages[0]);
const securityAudit = await scanner.checkSecurityAudit(result.packages[0]);

// Export results
const jsonReport = scanner.exportResults(result, 'json');
const csvReport = scanner.exportResults(result, 'csv');
const htmlReport = scanner.exportResults(result, 'html');

// Clear cached results
scanner.clearCache();
```

---

## API Reference

### `MonorepoScanner` Class

| Method                          | Returns                    | Description                                          |
| ------------------------------- | -------------------------- | ---------------------------------------------------- |
| `scan()`                        | `Promise<ScanResult>`      | Performs a full monorepo scan (cached for 5 minutes) |
| `generatePackageReports()`      | `Promise<PackageReport[]>` | Generates detailed reports for all packages          |
| `generatePackageReport(pkg)`    | `Promise<PackageReport>`   | Generates a detailed report for a single package     |
| `checkBuildStatus(pkg)`         | `Promise<BuildStatus>`     | Checks build status by running `npm run build`       |
| `checkTestCoverage(pkg)`        | `Promise<number>`          | Reads coverage reports and returns percentage        |
| `checkLintStatus(pkg)`          | `Promise<LintStatus>`      | Checks lint status by running `npm run lint`         |
| `checkSecurityAudit(pkg)`       | `Promise<AuditStatus>`     | Runs `pnpm audit --json` for vulnerability scanning  |
| `scanForFileTypes(types)`       | `Record<string, string[]>` | Scans all packages for specified file extensions     |
| `exportResults(result, format)` | `string`                   | Exports scan results as `json`, `csv`, or `html`     |
| `clearCache()`                  | `void`                     | Clears the in-memory scan cache                      |

### Convenience Functions

| Function                  | Description                                                   |
| ------------------------- | ------------------------------------------------------------- |
| `quickScan()`             | Performs a full scan using the default scanner instance       |
| `generateReports()`       | Generates reports for all packages using the default instance |
| `scanForFiles(fileTypes)` | Scans for file types using the default instance               |

### Types

| Type            | Description                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| `ScanResult`    | Full scan output (packages, stats, dependencyGraph, circularDependencies, outdatedPackages, timestamps) |
| `PackageReport` | Per-package report (package info, health, size, outdated deps, last modified, git info)                 |

---
