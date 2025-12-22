---
sidebar_position: 4
title: Commits Endpoint
---

# Commits Endpoint

Access git commit history via REST API.

## Get Package Commits

```bash
GET /api/commits/PACKAGE_PATH 
```
PACKAGE_PATH is the encoded path relative to workspace root (..%2F..%2Fpackages%2Fpackage-name)

This returns recent commits for the specified package directory.

Response:
```json
[
  {
    "hash": "04a542c550c2bbeb511572e82096ad47de3ce394",
    "author": "github-actions[bot]",
    "packageName": "../../packages/package-name",
    "date": "2020-11-05T05:20:07.000Z",
    "message": "chore(release): version packages",
    "type": "chore"
  },
  {
    "hash": "536a61fbfb78d0fde2545817049fsd54b4fc0bf9",
    "author": "Dev",
    "packageName": "../../packages/package-name",
    "date": "2020-09-23T06:53:52.000Z",
    "message": "feat(web-component): add Vue wrapper with tests and examples",
    "type": "feat"
  },
  ...
]
```