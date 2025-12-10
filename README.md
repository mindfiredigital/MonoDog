# MonoDog

The dashboard will provide visual management and monitoring capabilities for packages in monorepos using pnpm, turbo, or Nx. It will be distributed as an npm package installable in any monorepo to auto-generate a web UI for package oversight.

## Why MonoDog

The Monorepo Dashboard addresses the complexity of managing many interconnected packages. It automates critical, error-prone tasks like semantic versioning and CI/CD, while providing immediate visual feedback on dependencies and package health. This optimization leads to faster development cycles and more reliable releases.

## Installation

Install dependencies:

    pnpm install --ignore-scripts

Build Setup:

    pnpm run build

Run monoapp workspace using serve script:

    npm --workspace @monodog/monoapp run serve

## License

Licensed under the MIT License, Copyright © Mindfire Solutions
