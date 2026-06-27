#!/bin/sh
set -e

echo "⏳  Running migrations..."
MAX_ATTEMPTS=10
ATTEMPT=1
WAIT_SECONDS=3

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  if php artisan migrate --force 2>&1; then
    echo "✅  Migrations completed successfully"
    break
  fi
  
  if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
    echo "❌  Migration failed (attempt $ATTEMPT/$MAX_ATTEMPTS). Retrying in ${WAIT_SECONDS}s..."
    sleep $WAIT_SECONDS
    ATTEMPT=$((ATTEMPT + 1))
    WAIT_SECONDS=$((WAIT_SECONDS + 2))
  else
    echo "❌  Migrations failed after $MAX_ATTEMPTS attempts. Exiting."
    exit 1
  fi
done

echo "⚡  Caching config / routes..."
php artisan config:cache
php artisan route:cache

echo "🚀  Starting PHP-FPM..."
exec php-fpm
