FROM node:20-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV HUSKY=0
ENV CI=true

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

COPY . .

FROM base AS dev

CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm --filter @mindfiredigital/monodog run generate && pnpm run dev"]

FROM base AS runtime

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @mindfiredigital/monodog run generate
RUN pnpm run build

RUN mkdir -p /app/data

COPY docker/entrypoint.sh /usr/local/bin/monodog-entrypoint.sh
RUN chmod +x /usr/local/bin/monodog-entrypoint.sh

ENV MONODOG_DATABASE_PATH="file:/app/data/monodog.db"
ENV DATABASE_URL="file:/app/data/monodog.db"
ENV MONODOG_SERVER_HOST="0.0.0.0"
ENV MONODOG_SERVER_PORT="4000"
ENV MONODOG_DASHBOARD_HOST="0.0.0.0"
ENV MONODOG_DASHBOARD_PORT="3010"
ENV CORS_ORIGINS="http://localhost:3010,http://127.0.0.1:3010"

EXPOSE 4000 3010

CMD ["monodog-entrypoint.sh"]
