# MonoDog

Monodog delivers centralized visual management and monitoring capabilities for packages across monorepos using pnpm. Distributed as an easy-to-install npm package, it auto-generates a dedicated web user interface (UI) to provide comprehensive oversight of your package ecosystem.

## Why MonoDog

The Monorepo Dashboard addresses the complexity of managing many interconnected packages. It automates critical, error-prone tasks, while providing immediate visual feedback on dependencies and package health. This optimization leads to faster development cycles and more reliable releases.

## Installation

Install dependencies:

    pnpm install --ignore-scripts

Build Setup:

    pnpm run build

Run monoapp workspace using serve script:

    npm --workspace @mindfiredigital/monodog run serve

### Install Package in Monorepo

Install monodog in a monorepo workspace root:

    pnpm install --save-dev @mindfiredigital/monodog -w

Run app using serve script:

    cd ./mindfiredigital-monodog/ && npm run serve

## License

Licensed under the MIT License, Copyright © Mindfire Solutions

