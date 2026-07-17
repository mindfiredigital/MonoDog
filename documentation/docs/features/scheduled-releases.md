---
sidebar_position: 8
title: Scheduled Releases
---

# Scheduled Releases

Automate package releases by scheduling them for a future date and time.

## Overview

Scheduled Releases allow you to plan and automate your release workflow:

- Schedule releases for specific dates and times.
- The background worker automatically executes releases when they are due.
- Track the status of scheduled releases (pending, completed, failed).
- Cancel pending releases before they execute.

## How It Works

1. **Create a Schedule**: From the dashboard or API, specify the package, version, date/time, and a summary of changes.
2. **Worker Polls**: A background worker runs every 60 seconds checking for releases that are due.
3. **Auto-Execute**: When a release is due, the worker triggers the publish workflow and updates the release status.
4. **Track Progress**: View all scheduled releases and their statuses from the Scheduled Releases page.

## Using the Dashboard

### Viewing Scheduled Releases

Navigate to **Pipeline** → **Release Pipelines** → **Scheduled Releases** to see all scheduled releases with their statuses.

### Creating a Schedule

1. Click **Schedule Release** on the Scheduled Releases page.
2. Select the package to release.
3. Enter the target version number.
4. Pick the date and time for the release.
5. Add a summary describing the changes.
6. Click **Schedule** to confirm.

### Cancelling a Release

Click the cancel button next to any release with a `pending` status. Only pending releases can be cancelled — completed or failed releases cannot be modified.

## Using the API

```bash
# Schedule a new release
curl -X POST http://localhost:4000/api/pipelines/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "packageName": "@mindfiredigital/monodog",
    "version": "1.6.0",
    "scheduledAt": "2026-07-20T10:00:00Z",
    "summary": "Feature release"
  }'

# View all scheduled releases
curl http://localhost:4000/api/pipelines/scheduled

# Cancel a pending release
curl -X DELETE http://localhost:4000/api/pipelines/scheduled/{id}
```

## Background Worker

The scheduled release worker starts automatically when the MonoDog server boots

- **Poll interval**: Every 60 seconds
- **Execution**: Triggers the GitHub Actions `release.yml` workflow
- **Status updates**: Automatically marks releases as `completed` or `failed`
- **Cleanup**: Removes stale entries after successful execution

## Release Statuses

| Status      | Description                               |
| ----------- | ----------------------------------------- |
| `pending`   | Release is scheduled but not yet executed |
| `completed` | Release executed successfully             |
| `failed`    | Release execution encountered an error    |
