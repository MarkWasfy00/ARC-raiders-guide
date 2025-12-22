#!/bin/sh
set -e

echo "🚀 Starting ARC Raiders application..."

# Extract database connection details from DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "⏳ Waiting for database to be ready at $DB_HOST:$DB_PORT..."

# Wait for PostgreSQL to be ready
max_attempts=30
attempt=0

until node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => client.end())
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
" 2>/dev/null; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "❌ Database connection failed after $max_attempts attempts"
    exit 1
  fi
  echo "⏳ Database is unavailable - attempt $attempt/$max_attempts..."
  sleep 2
done

echo "✅ Database is ready!"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy || echo "⚠️  Migrations may have already been applied or failed"

# Start the application
echo "🎯 Starting application..."
exec "$@"
