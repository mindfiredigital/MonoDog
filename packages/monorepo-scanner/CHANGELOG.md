# @mindfiredigital/monorepo-scanner

## 1.0.10

### Patch Changes

- [#66](https://github.com/mindfiredigital/MonoDog/pull/66) [`9e66dbd`](https://github.com/mindfiredigital/MonoDog/commit/9e66dbdd575f56c2bb98711087cb468b43a40a2c) Thanks [@ansumanmindfire](https://github.com/ansumanmindfire)! - ### New Features
  - Use github rest api to get the release data directly from github.
  - Added changelog parser - parses the local changelog & structurally formats.
  - Implemented a commit retrieval system to get the commits associated with the respective release.
  - Formatted changelog data are rendered in the UI as cards for the user.
  - Dropdown to select a particular version to render.
  - Dropdown to toggle the commit's component visibility per release

- Updated dependencies [[`9e66dbd`](https://github.com/mindfiredigital/MonoDog/commit/9e66dbdd575f56c2bb98711087cb468b43a40a2c)]:
  - @mindfiredigital/utils@1.0.3
