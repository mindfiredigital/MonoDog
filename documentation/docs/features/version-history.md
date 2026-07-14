---
title: Version History & Changelogs
---

# Version History & Changelogs

MonoDog provides a highly resilient, enterprise-grade architecture for tracking the version history of every package inside your monorepo.

## Dual-Source Architecture

The version history for a package does not rely on a single source of truth. It performs a **Dual-Fetch**:

1. **Local File System:** It uses a regex parser to slice up local `CHANGELOG.md` files and arranges it in a structured format.
2. **Remote API:** Data are drawn from the Published Release Tags using the official GitHub Rest APIs.

The engine deduplicates identical versions and sorts them chronologically.

## Check Package Version History

You can explore the complete timeline of releases for any package directly through the MonoDog Dashboard:

1. **Open the Dashboard:** Navigate to your MonoDog UI and login with your github account.
2. **Select a Package:** From the main Packages List, click on the specific package you want to inspect.
3. **Explore the Timeline:** You will see a beautifully rendered timeline of all past versions, complete with release dates, authors, and the exact release notes associated with that update!
