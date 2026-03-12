---
sidebar_position: 8
title: Pipelines API
---

# Pipelines API

These endpoints power the pipeline management features in the dashboard and are used by the frontend components.

## List recent pipelines

```bash
GET /api/pipelines
```

Returns a paginated list of the most recent pipeline records.

Response example:

```json
{
  "success": true,
  "pipelines": [
    {
      "id": "abc123",
      "repo": "my-org/my-repo",
      "status": "completed",
      "workflow": "build-and-test",
      "createdAt": "2026-03-01T14:22:10Z"
    }
  ],
  "total": 1
}
```

## Update pipeline status

```bash
PUT /api/pipelines/:pipelineId/status
```

Updates a pipeline's stored status based on the latest GitHub workflow run.

Request body example (partial):

```json
{
  "status": "in_progress",
  "conclusion": null
}
```

Response:

```json
{
  "success": true,
  "pipeline": {
    "id": "abc123",
    "status": "in_progress"
  }
}
```

## List available workflows

```bash
GET /api/workflows/:owner/:repo/available
```

Returns the workflows configured in the specified GitHub repository.

Example response:

```json
{
  "success": true,
  "workflows": [
    { "id": 123, "name": "build.yml" },
    { "id": 456, "name": "deploy.yml" }
  ]
}
```

## Get workflow runs

```bash
GET /api/workflows/:owner/:repo
```

Fetches recent runs for the given repository.

Sample response:

```json
{
  "success": true,
  "runs": [
    { "id": 789, "status": "completed", "conclusion": "success" }
  ]
}
```

## Get specific workflow run with jobs

```bash
GET /api/workflows/:owner/:repo/runs/:runId
```

Includes job details for the specified workflow run.

Example response:

```json
{
  "success": true,
  "run": {
    "id": 789,
    "jobs": [
      { "id": 111, "name": "build", "status": "completed" }
    ]
  }
}
```

## Get job logs

```bash
GET /api/workflows/:owner/:repo/jobs/:jobId/logs
```

Returns the raw log text for a single job. Response will be plain text.
```

Retrieves the logs produced by a single job.

## Trigger a workflow

```bash
POST /api/workflows/:owner/:repo/trigger
```

Starts a new run of the selected workflow (requires maintain permissions). The request can include an optional `ref` and `inputs` object.

Example request:

```json
{
  "ref": "main",
  "inputs": { "package": "@org/package-a" }
}
```

Response:

```json
{
  "success": true,
  "runId": 456789
}
```

## Cancel a workflow run

```bash
POST /api/workflows/:owner/:repo/runs/:runId/cancel
```

Cancels an in‑progress run (requires maintain permissions).

Response example:

```json
{
  "success": true,
  "message": "cancellation requested"
}
```

## Rerun a workflow

```bash
POST /api/workflows/:owner/:repo/runs/:runId/rerun
```

Restarts a completed workflow run.

Example response:

```json
{
  "success": true,
  "runId": 790
}
```

## Get pipeline audit logs

```bash
GET /api/pipelines/:pipelineId/audit-logs
```

Returns change history for the given pipeline record.
