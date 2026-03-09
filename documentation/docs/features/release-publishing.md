---
sidebar_position: 6
title: Release Publishing
---

# Release Publishing

Streamline your package releases with automated versioning, changesets, and publishing workflows.

## Overview

Release Publishing helps you manage the entire package release lifecycle:

- Create changesets to document changes across packages.
- Preview version bumps and potential breaking changes.
- Trigger automated publishing workflows.


## Key Features

### Changeset Management

Organize and manage changes across multiple packages:

- Create detailed changesets documenting what changed and why.
- Group related package updates together.
- Attach meaningful summaries to each changeset.
- Track changeset authors for accountability.

### Publish Preview

Plan your releases before they go live:

- Preview version bumps (major, minor, patch) for each package.
- See affected packages and their new versions.
- Run validation checks:
  - Verify working tree is clean.
  - Check user permissions.
  - Validate CI/CD pipeline status.
  - Confirm versions are available on npm.

### Publishing Workflow

Automate your release process:

- Trigger GitHub Actions workflows with a single click.
- Automatically create release commits and tags.
- Publish packages to npm registry.
- Create GitHub releases with changelog.

## Next Steps

- [API Reference - Publish/Release](/api-reference/publish)
