#!/bin/sh
set -e

echo "🚀 Starting ARC Raiders application..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if npx prisma db pull --schema=/app/prisma/schema.prisma 2>/dev/null; then
    echo "✅ Database is ready!"
    break
  fi
  attempt=$((attempt + 1))
  echo "⏳ Database is unavailable - attempt $attempt/$max_attempts..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Database connection failed after $max_attempts attempts"
  exit 1
fi

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy || echo "⚠️  Migrations may have already been applied or failed"

# Seed database if SEED_DATABASE env var is set or if it's the first run
if [ "${SEED_DATABASE:-true}" = "true" ]; then
  echo "🌱 Running database seed..."
  npm run db:seed || echo "⚠️  Seeding failed or data already exists"
  echo "✅ Seeding completed!"
else
  echo "⏭️  Skipping database seed (SEED_DATABASE=${SEED_DATABASE})"
fi

# Start the application
echo "🎯 Starting application..."
exec "$@"
