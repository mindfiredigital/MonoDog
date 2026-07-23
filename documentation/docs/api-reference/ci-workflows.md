---
sidebar_position: 8
title: CI Workflows
---

# CI/CD Workflows API

Manage and monitor GitHub Actions CI/CD workflows directly through the MonoDog API.

## Endpoints

### Get CI Status

```
GET /api/ci/status
```

Returns the recent CI build status for the entire monorepo from GitHub Actions.

**Query Parameters:**

| Parameter  | Type   | Required | Description                                             |
| ---------- | ------ | -------- | ------------------------------------------------------- |
| `status`   | string | No       | Filter by status (`completed`, `in_progress`, `queued`) |
| `per_page` | number | No       | Number of results per page (default: 10)                |

**Response:**

```json
{
  "success": true,
  "data": {
    "runs": [
      {
        "id": 12345,
        "name": "Release",
        "status": "completed",
        "conclusion": "success",
        "html_url": "https://github.com/...",
        "created_at": "2026-07-10T12:00:00Z",
        "updated_at": "2026-07-10T12:05:00Z"
      }
    ]
  }
}
```

---

### Trigger CI Build

```
POST /api/ci/trigger
```

Triggers a GitHub Actions workflow run via the `workflow_dispatch` event.

**Request Body:**

```json
{
  "workflowId": "release.yml",
  "ref": "main",
  "inputs": {
    "source": "monodog"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Workflow triggered successfully"
}
```

:::info
MonoDog automatically reads your workflow YAML files to detect valid `workflow_dispatch` inputs. Only declared inputs are sent to the GitHub API.
:::

---

### Get Build Logs

```
GET /api/ci/builds/:buildId/logs
```

Returns the raw log output for a specific CI build run.

---

### Get Build Artifacts

```
GET /api/ci/builds/:buildId/artifacts
```

Returns a list of artifacts produced by a specific CI build run.

---

## Authentication

All CI/CD endpoints require a valid GitHub OAuth session with `repo` and `workflow` scopes.

## Error Responses

| Status | Description               |
| ------ | ------------------------- |
| 401    | Authentication required   |
| 403    | Insufficient permissions  |
| 404    | Workflow or run not found |
| 500    | GitHub API error          |
