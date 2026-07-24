# @mindfiredigital/monodog

## 1.6.0

### Minor Changes

- Merge pull request #122 from mindfiredigital/development

- [#66](https://github.com/mindfiredigital/MonoDog/pull/66) [`9e66dbd`](https://github.com/mindfiredigital/MonoDog/commit/9e66dbdd575f56c2bb98711087cb468b43a40a2c) Thanks [@ansumanmindfire](https://github.com/ansumanmindfire)! - ### New Features
  - `Branch Selection:` Added remote branch selection dropdown via GitHub REST API for manual pipeline dispatches.
  - `RBAC & Viewer Role:` Implemented `Viewer` read-only role, public repository permission fallback, and `RoleGuard` UI wrapper.
  - `Release Pipeline Enhancements:` Filtered pipeline history by repository owner/repo, automated changeset git commits, and enabled `rootPath` configuration.
  - `Changelog Viewer:` Added local and GitHub Releases changelog parser with Markdown rendering and version filtering.

### Patch Changes

- Updated dependencies [[`9e66dbd`](https://github.com/mindfiredigital/MonoDog/commit/9e66dbdd575f56c2bb98711087cb468b43a40a2c)]:
  - @mindfiredigital/monorepo-scanner@1.0.10
