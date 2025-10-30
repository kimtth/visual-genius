#!/bin/sh
set -e

echo "Running database migrations..."
tsx src/server/db/migrate.ts || echo "Migration failed, but continuing..."

echo "Starting Next.js application..."
exec "$@"
