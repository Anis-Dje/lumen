# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – Composer dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM composer:2.8 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

# Install production deps only (no dev tools in the image)
RUN composer install \
      --no-dev \
      --no-interaction \
      --no-progress \
      --prefer-dist \
      --optimize-autoloader \
      --no-scripts

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – Runtime image
# ─────────────────────────────────────────────────────────────────────────────
FROM php:8.4-fpm-alpine AS runtime

LABEL org.opencontainers.image.title="TechVault API"
LABEL org.opencontainers.image.description="Laravel 13 backend for TechVault"

# System deps for pgsql + sockets
RUN apk add --no-cache \
      postgresql-client \
      libpq-dev \
      icu-dev \
      oniguruma-dev \
      zip \
      libzip-dev \
 && docker-php-ext-install \
      pdo \
      pdo_pgsql \
      pgsql \
      intl \
      mbstring \
      zip \
      opcache

# OPcache tuned for production
RUN { \
      echo 'opcache.enable=1'; \
      echo 'opcache.memory_consumption=128'; \
      echo 'opcache.interned_strings_buffer=16'; \
      echo 'opcache.max_accelerated_files=10000'; \
      echo 'opcache.revalidate_freq=0'; \
      echo 'opcache.validate_timestamps=0'; \
      echo 'opcache.fast_shutdown=1'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

# Copy vendored dependencies from Stage 1
COPY --from=vendor /app/vendor ./vendor

# Copy application source
COPY . .

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html \
 && chmod -R 755 /var/www/html/storage \
 && chmod -R 755 /var/www/html/bootstrap/cache

# Create the storage symlink and warm the config/route cache at build time
# (the .env is injected via env vars at runtime — see docker-compose.yml)
RUN php artisan storage:link --no-interaction || true

EXPOSE 9000

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
