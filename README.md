# MonoDog

Monodog delivers centralized visual management and monitoring capabilities for packages across monorepos using pnpm. Distributed as an easy-to-install npm package, it auto-generates a dedicated web user interface (UI) to provide comprehensive oversight of your package ecosystem.
<img width="1593" height="807" alt="package-scan" src="https://github.com/user-attachments/assets/d7e86b80-9f6a-4608-9103-68e6d660cc36" />

## Why MonoDog

The Monorepo Dashboard addresses the complexity of managing many interconnected packages. It automates critical, error-prone tasks, while providing immediate visual feedback on dependencies and package health. This optimization leads to faster development cycles and more reliable releases.

## Installation

Install dependencies:

    pnpm install

Build Setup:

    pnpm run build

Run monodog workspace using serve script:

    npm --workspace @mindfiredigital/monodog run serve

### Install Package in Monorepo

Install monodog in a monorepo workspace root:

    pnpm dlx @mindfiredigital/monodog

Run app using serve script:

    cd ./monodog/ && npm run serve

## License

Licensed under the MIT License, Copyright © Mindfire Solutions

