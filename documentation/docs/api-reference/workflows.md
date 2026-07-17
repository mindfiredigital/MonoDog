---
sidebar_position: 10
title: Workflows
---

# Workflows API

Query GitHub Actions workflows, runs, and job details.

## Endpoints

### Get Available Workflows

```
GET /api/workflows/:owner/:repo/available
```

Lists all GitHub Actions workflows configured in the repository.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "name": "Release",
      "path": ".github/workflows/release.yml",
      "state": "active"
    }
  ]
}
```

---

### Get Workflow Runs

```
GET /api/workflows/:owner/:repo
```

Returns recent runs for a specific workflow.

**Query Parameters:**

| Parameter  | Type   | Required | Description                    |
| ---------- | ------ | -------- | ------------------------------ |
| `status`   | string | No       | Filter by run status           |
| `per_page` | number | No       | Results per page (default: 10) |

---

### Get Workflow Jobs

```
GET /api/workflows/:owner/:repo/runs/:runId
```

Returns the jobs within a specific workflow run, including step-level details.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 67890,
      "name": "build",
      "status": "completed",
      "conclusion": "success",
      "steps": [
        {
          "name": "Checkout",
          "status": "completed",
          "conclusion": "success"
        }
      ]
    }
  ]
}
```

---

### Get Job Logs

```
GET /api/workflows/:owner/:repo/jobs/:jobId/logs
```

Returns the raw log output for a specific job. Logs include ANSI color codes which the dashboard renders with full color support.

---

## Authentication

All workflow endpoints require a valid GitHub OAuth session with `repo` and `workflow` scopes.

## Error Responses

| Status | Description                                |
| ------ | ------------------------------------------ |
| 401    | Authentication required or bad credentials |
| 403    | Insufficient permissions                   |
| 404    | Workflow not found                         |
| 500    | GitHub API error                           |
