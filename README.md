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

    pnpm --filter @mindfiredigital/monodog run serve

### Install Package in Monorepo

Install monodog in a monorepo workspace root:

    pnpm dlx @mindfiredigital/monodog

Run app using serve script:

    cd ./monodog/ && pnpm run serve

## Docker

Build and run MonoDog with Docker Compose:

    docker compose --env-file .env.docker up --build

The container starts both services:

- Dashboard: `http://localhost:3010`
- API: `http://localhost:4000/api`

The Docker setup uses `.env.docker` for runtime defaults and persists SQLite data
using the named volume `monodog-data` by default.

For GitHub OAuth in Docker, set your GitHub app callback URL to:

    http://localhost:3010/auth/callback

To use a host bind mount instead of the named volume, set this in `.env.docker`:

    MONODOG_DATA_MOUNT=./.docker-data:/app/data

To stop the stack:

    docker compose down

To remove the persisted database volume too:

    docker compose down -v

## License

Licensed under the MIT License, Copyright © Mindfire Solutions
