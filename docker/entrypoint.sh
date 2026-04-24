#!/bin/sh
set -eu

cd /app

export DATABASE_URL="${DATABASE_URL:-${MONODOG_DATABASE_PATH:-file:/app/data/monodog.db}}"

./node_modules/.bin/prisma migrate deploy --schema packages/backend/prisma/schema.prisma

exec node packages/backend/dist/cli.js --serve --root /app
