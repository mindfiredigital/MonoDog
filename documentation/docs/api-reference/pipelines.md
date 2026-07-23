---
sidebar_position: 9
title: Pipelines
---

# Pipelines API

Manage release pipelines, scheduled releases, and audit logs.

## Endpoints

### Get All Pipelines

```
GET /api/pipelines
```

Returns a list of all release pipelines with their current status.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "pipeline-uuid",
      "name": "Release Pipeline",
      "status": "completed",
      "triggeredBy": "username",
      "createdAt": "2026-07-10T12:00:00Z",
      "completedAt": "2026-07-10T12:05:00Z"
    }
  ]
}
```

---

### Schedule a Release

```
POST /api/pipelines/schedule
```

Schedules a package release for a future date/time.

**Request Body:**

```json
{
  "packageName": "@mindfiredigital/monodog",
  "version": "1.6.0",
  "scheduledAt": "2026-07-20T10:00:00Z",
  "summary": "Feature release with CI improvements"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "release-uuid",
    "status": "pending",
    "scheduledAt": "2026-07-20T10:00:00Z"
  }
}
```

---

### Get Scheduled Releases

```
GET /api/pipelines/scheduled
```

Returns all scheduled releases and their current statuses.

---

### Cancel a Scheduled Release

```
DELETE /api/pipelines/scheduled/:id
```

Cancels a pending scheduled release. Only releases with `pending` status can be cancelled.

---

### Get Pipeline Audit Logs

```
GET /api/pipelines/:id/audit-logs
```

Returns the audit trail for a specific pipeline, showing all state changes and actions.

---

## Authentication

All pipeline endpoints require a valid GitHub OAuth session with write permissions.

## Error Responses

| Status | Description                                  |
| ------ | -------------------------------------------- |
| 400    | Invalid request or release already scheduled |
| 401    | Authentication required                      |
| 403    | Insufficient permissions (write required)    |
| 404    | Pipeline or release not found                |
| 500    | Internal server error                        |
