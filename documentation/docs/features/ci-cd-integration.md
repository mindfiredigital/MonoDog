---
sidebar_position: 7
title: CI/CD Integration
---

# CI/CD Integration

Monitor and trigger your GitHub Actions CI/CD workflows directly from the MonoDog dashboard.

## Overview

MonoDog integrates with GitHub Actions to provide full visibility into your CI/CD pipelines:

- View all workflow runs and their statuses.
- Trigger new workflow runs with custom inputs.
- Inspect individual job logs with ANSI color rendering.
- Monitor build durations and success rates.

## Key Features

### Workflow Monitoring

View all GitHub Actions workflows configured in your repository:

- Real-time status updates with automatic 10-second polling.
- Build duration computed from workflow timestamps.
- Filter by workflow status (success, failure, in progress).

### Build Triggering

Trigger workflow runs directly from the dashboard:

- Select from available workflows in your repository.
- MonoDog reads your workflow YAML files to detect valid `workflow_dispatch` inputs.
- Custom input parameters are automatically populated.

### Job Logs

Drill into individual workflow runs to view detailed job logs:

- Full ANSI color rendering for terminal output.
- Step-by-step execution breakdown.
- Error highlighting for failed steps.

## Accessing CI/CD

### Via Dashboard

Navigate to the **Pipeline** page and select the **CI/CD Workflows** tab to view your workflow runs.

### Via API

```bash
# Get CI build status
curl http://localhost:4000/api/ci/builds

# Trigger a new build
curl -X POST http://localhost:4000/api/ci/trigger \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "release.yml"}'

# Get available workflows
curl http://localhost:4000/api/workflows
```

## Requirements

- A GitHub repository with Actions workflows configured.
- A valid GitHub OAuth token with `repo` and `workflow` scopes.
- Workflow files must be in the `.github/workflows/` directory.
