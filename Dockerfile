# ========================================================
# Estágio 1: Compilação dos Ativos Frontend (Vite / React)
# ========================================================
FROM node:20-alpine AS node_builder

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# ========================================================
# Estágio 2: Ambiente PHP-FPM 8.3 & Servidor Nginx (Produção)
# ========================================================
FROM php:8.3-fpm-alpine

# Instalar utilitários de sistema e bibliotecas necessárias
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    sqlite-dev \
    icu-dev \
    oniguruma-dev \
    bash

# Configurar e instalar extensões do PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        pdo_sqlite \
        mbstring \
        zip \
        gd \
        bcmath \
        intl \
        opcache

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar arquivos do projeto
COPY . .

# Copiar os artefatos compilados do estágio node_builder
COPY --from=node_builder /app/public/build ./public/build

# Instalar dependências PHP para produção (sem pacotes de dev)
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Configurar permissões de ficheiros
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Configurações do Nginx, Supervisor e Entrypoint
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Converter quebras de linha para LF e dar permissão de execução
RUN tr -d '\r' < /usr/local/bin/entrypoint.sh > /usr/local/bin/entrypoint.sh.tmp \
    && mv /usr/local/bin/entrypoint.sh.tmp /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
