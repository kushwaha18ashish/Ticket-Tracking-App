#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database (if empty)..."
  npx prisma db seed
fi

echo "Starting server..."
exec node dist/index.js
