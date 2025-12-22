---
sidebar_position: 1
title: Overview
---

# Getting Started with Monodog

This guide will take you through the process of learning Monodog and how to set it up in your monorepo.


## How Monodog Works

Monodog acts as a service layer within your monorepo that:

### 1. **Scans Your Monorepo**

- Uncovers all the packages contained in the monorepo
- Studies the package metadata (name, version, dependencies)
- Recognizes configuration files and scripts

### 2. **Monitors Package Health**

- Linting status is checked
- Security audits are conducted
- Build status is monitored

### 3. **Provides APIs**
- RESTful interfaces for monorepo data access
- Instant health metrics
- Relationships and dependencies between packages
- Information on Git history and contributors

### 4. **Powers the Dashboard**
- Graphical representation of your monorepo
- Overview of package health
- Analytics of performance
- Complete package data

## Architecture

```
┌─────────────────────────────────────────────┐
│   Your Monorepo                             │
├─────────────────────────────────────────────┤
│   ┌─────────────────────────────────────┐   │
│   │ Monodog Service                     │   │
│   ├─────────────────────────────────────┤   │
│   │ - Package Scanner                   │   │
│   │ - Health Monitor                    │   │
│   │ - Dependency Analyzer               │   │
│   │ - Git Service                       │   │
│   └─────────────────────────────────────┘   │
│              ↓                              │
│   ┌─────────────────────────────────────┐   │
│   │ REST API (Express.js)               │   │
│   └─────────────────────────────────────┘   │
│              ↓                              │
│   ┌─────────────────────────────────────┐   │
│   │ Dashboard Frontend (React)          │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Key Capabilities

| Capability | Description |
|---|---|
| **Package Discovery** | Automatically finds all packages in your monorepo |
| **Health Metrics** | Monitors the status of linting, security, and building |
| **Dependency Analysis** | Shows the relationships between packages in a visual manner |

## What's Next?

Are you set to start using it? Visit [Prerequisites](/getting-started/prerequisites) to verify your setup, then proceed to [Quick Start](/getting-started/quick-start)!

In case you're up for the challenge of installation, here’s the [Installation Guide](/installation/install-npm) for you!
