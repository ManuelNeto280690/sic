#!/bin/sh
set -e

# Setup storage and cache directories
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

# Ensure SQLite file exists if using sqlite
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    mkdir -p /var/www/html/database
    if [ ! -f /var/www/html/database/database.sqlite ]; then
        touch /var/www/html/database/database.sqlite
    fi
    chmod -R 775 /var/www/html/database
    chown -R www-data:www-data /var/www/html/database
fi

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    echo "APP_KEY is missing. Generating application key..."
    php artisan key:generate --force
fi

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Seed database if requested (e.g. initial setup)
if [ "${RUN_SEEDER:-false}" = "true" ]; then
    echo "Running database seeders..."
    php artisan db:seed --force
fi

# Create symlink for public storage
php artisan storage:link --force 2>/dev/null || true

# Cache configurations in production if not in debug mode
if [ "${APP_DEBUG:-false}" != "true" ]; then
    echo "Caching configurations for production..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "Starting services..."
exec "$@"
