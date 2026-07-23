# @mindfiredigital/monodog-dashboard

> A React-based interactive dashboard UI for visualizing and managing monorepo packages, dependencies, health metrics, CI/CD pipelines, and releases.

[![npm version](https://img.shields.io/npm/v/@mindfiredigital/monodog-dashboard.svg)](https://www.npmjs.com/package/@mindfiredigital/monodog-dashboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@mindfiredigital/monodog-dashboard` is the frontend application for MonoDog. It provides a real-time, visual dashboard for tracking the health, dependencies, CI/CD pipelines, and overall status of all packages within a monorepo. It is served as static assets by the `@mindfiredigital/monodog` backend server.

---

## Tech Stack

| Component | Technology | Description |
| --- | --- | --- |
| **Framework** | React 18 (Functional Components) | Core library for building the user interface |
| **Routing** | React Router v6 | Client-side routing with protected route guards |
| **Styling** | Tailwind CSS | Utility-first framework for responsive design |
| **Graph Visualization** | React Flow + Dagre | Interactive dependency graph with auto-layout |
| **Markdown** | react-markdown + rehype-sanitize | XSS-safe Markdown rendering for changelogs |
| **HTTP Client** | Axios | API communication with the backend |
| **Build Tool** | Vite | Fast development server and production bundling |
| **Testing** | Vitest + Testing Library | Unit and component testing |

---

## Features

### Package Overview
- **Package Listing:** View all packages in the monorepo with their names, versions, types (`app`, `lib`, `tool`), and dependency counts.
- **Package Details:** Drill into individual packages to view full metadata, scripts, and dependency trees.
- **Recent Commits:** View Git commit history per package with author, date, and message details.

### Interactive Dependency Graph
- **Visual Dependency Map:** Interactive React Flow graph with Dagre layout engine showing all internal workspace dependency relationships.
- **Custom Package Nodes:** Color-coded nodes by package type with version badges and dependency counts.
- **Graph Controls:** Zoom, pan, fit-to-view, and toggle dependency details.
- **Dependency Details Panel:** Click any package node to view its full dependency and devDependency lists.

### Health Status Dashboard
- **Per-Package Health Scores:** View overall health scores (0-100) for each package based on build, test, lint, and security metrics.
- **Health Refresh:** Trigger full health recalculation across all packages from the UI.
- **Metric Breakdown:** Individual status indicators for build status, test coverage percentage, lint pass/fail, and security audit results.

### CI/CD Integration
- **Pipeline Overview:** View all GitHub Actions workflow runs with status badges (`success`, `failure`, `in_progress`).
- **Target Branch Selection:** Dynamic remote branch dropdown via GitHub REST API for selecting target branches when manually triggering pipeline dispatches.
- **Build Details:** Drill into individual workflow runs with real-time log streaming.
- **Manual Trigger:** Trigger `workflow_dispatch` events directly from the dashboard with branch selection.

### Configuration Inspector
- **Config File Scanner:** Detects and displays configuration files across the monorepo (`tsconfig.json`, `.eslintrc`, `turbo.json`, etc.).
- **Config Preview:** View the contents of detected configuration files with syntax highlighting.

### Release Management
- **Publish Control:** Create and manage changesets for semantic version bumps directly from the UI.
- **Version Selection:** Choose `patch`, `minor`, or `major` bumps per package with auto-generated changeset descriptions.
- **Scheduled Releases:** Schedule future releases with cron-based execution and GitHub PR creation.
- **Release Pipeline:** View release pipeline history filtered by repository owner.

### Changelog Viewer
- **Version-Grouped Entries:** Browse changelogs grouped by release version.
- **Markdown Rendering:** XSS-safe Markdown rendering of changelog content using `react-markdown` with `rehype-sanitize`.
- **Version Filtering:** Dropdown to select and view specific version changelogs.
- **Commit Association:** Toggle visibility of commits associated with each release.

### RBAC (Role-Based Access Control)
- **GitHub OAuth Login:** Secure authentication via GitHub OAuth flow.
- **Role-Based UI Protection:** `RoleGuard` component wraps protected UI elements based on user roles (`admin`, `write`, `read`).
- **Viewer Read-Only Mode:** `Viewer` role users see the dashboard in read-only mode with action buttons disabled.
- **Public Repository Fallback:** Automatic permission detection for public repositories via GitHub API.
- **Protected Routes:** Route-level access control with role-based sidebar navigation.

---

## Getting Started

This package is automatically served by the `@mindfiredigital/monodog` backend. You do not need to install it separately.

To run MonoDog (which includes the dashboard):

```bash
pnpm dlx @mindfiredigital/monodog
```

For local development:

```bash
# Clone the repository
git clone https://github.com/mindfiredigital/MonoDog.git
cd apps/dashboard

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

---
