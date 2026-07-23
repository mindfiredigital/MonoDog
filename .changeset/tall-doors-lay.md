---
'@mindfiredigital/monodog': minor
'@mindfiredigital/monorepo-scanner': patch
---

### New Features

- `Branch Selection:` Added remote branch selection dropdown via GitHub REST API for manual pipeline dispatches.
- `RBAC & Viewer Role:` Implemented `Viewer` read-only role, public repository permission fallback, and `RoleGuard` UI wrapper.
- `Release Pipeline Enhancements:` Filtered pipeline history by repository owner/repo, automated changeset git commits, and enabled `rootPath` configuration.
- `Changelog Viewer:` Added local and GitHub Releases changelog parser with Markdown rendering and version filtering.
