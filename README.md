# MonoDog

The dashboard will provide visual management and monitoring capabilities for packages in monorepos using pnpm, turbo, or Nx. It will be distributed as an npm package installable in any monorepo to auto-generate a web UI for package oversight.

## Why MonoDog

The Monorepo Dashboard addresses the complexity of managing many interconnected packages. It automates critical, error-prone tasks like semantic versioning and CI/CD, while providing immediate visual feedback on dependencies and package health. This optimization leads to faster development cycles and more reliable releases.

## Installation

### Install Package in Monorepo

```bash
# Install Backend Server
pnpm install  @monodog/backend -w
# Install dashboard
pnpm install  @monodog/dashboard -w

#setup dashboard as workspace and run backend server
pnpm monodog-cli @monodog/dashboard --serve --root .

#setup database
pnpm prisma migrate dev --schema ./node_modules/@monodog/backend/prisma/schema.prisma

pnpm prisma generate --schema ./node_modules/@monodog/backend/prisma/schema.prisma

#run dashborad app
cd packages/monodog-dashboard
pnpm install
pnpm run build
pnpm run preview
```

## License

Licensed under the MIT License, Copyright © Mindfire Solutions
