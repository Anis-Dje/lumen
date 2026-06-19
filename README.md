# TechVault — E-Commerce Platform

> A professional, portfolio-ready e-commerce platform for tech products with a decoupled architecture: **React** frontend + **Laravel 11** REST API backend + **Supabase** (PostgreSQL) database.

---

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Guide](#setup-guide)
  - [1. Database (Supabase)](#1-database-supabase)
  - [2. Backend (Laravel)](#2-backend-laravel)
  - [3. Frontend (React)](#3-frontend-react)
- [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Deployment Guide](#deployment-guide)
  - [Backend Deployment (Railway / Render / VPS)](#backend-deployment)
  - [Frontend Deployment (Vercel / Netlify)](#frontend-deployment)
  - [Environment Variables Reference](#environment-variables-reference)
- [Seed Data & Test Accounts](#seed-data--test-accounts)
- [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  React 18 + TypeScript + Vite + Tailwind CSS v4 + Zustand       │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST / JSON (Bearer token auth)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│  Laravel 11 + PHP 8.3 + Sanctum (API tokens)                   │
│  Service Layer → Form Requests → API Resources                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ pgsql (SSL)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL 15)                      │
│  10 Tables · UUID PKs · JSONB · GIN Indexes · RLS-ready         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **PHP** | 8.2+ | Laravel runtime |
| **Composer** | 2.x | PHP dependency manager |
| **Node.js** | 18+ | Frontend build tooling |
| **npm** | 9+ | JS package manager |
| **PostgreSQL** | 15+ | Database (via Supabase or local) |
| **Git** | 2.x | Version control |

---

## Project Structure

```
Crm Website/
├── database/
│   └── schema.sql              # Full DDL: tables, indexes, enums, seed data
│
├── backend/                    # Laravel 11 REST API
│   ├── app/
│   │   ├── Enums/              # OrderStatus, UserRole, LedgerEntryType
│   │   ├── Exceptions/         # InsufficientStockException
│   │   ├── Http/
│   │   │   ├── Controllers/    # 9 controllers (Auth, Cart, Checkout, etc.)
│   │   │   ├── Middleware/     # EnsureUserIsAdmin
│   │   │   ├── Requests/      # 7 Form Request validators
│   │   │   └── Resources/     # 7 API Resource transformers
│   │   ├── Models/             # 10 Eloquent models with UUIDs
│   │   └── Services/          # OrderProcessing, FidelityEngine, Cart
│   ├── bootstrap/app.php       # Middleware aliases, routing
│   ├── config/fidelity.php     # Fidelity program configuration
│   └── routes/api.php          # All API route definitions
│
├── frontend/                   # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # 13 reusable components
│   │   ├── pages/              # 8 pages (Catalog, Checkout, Admin, etc.)
│   │   ├── stores/             # 4 Zustand stores
│   │   ├── lib/api.ts          # Axios API client with interceptors
│   │   ├── types/index.ts      # TypeScript interfaces
│   │   └── index.css           # Design system tokens + Tailwind v4
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md                   # This file
```

---

## Setup Guide

### 1. Database (Supabase)

#### Option A: Supabase Cloud (Recommended)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in the Supabase dashboard
3. Copy the entire contents of `database/schema.sql`
4. Paste and click **Run** — this creates all 10 tables, indexes, enums, and inserts seed data
5. Note your connection credentials from **Settings → Database**:
   - Host: `db.<project-ref>.supabase.co`
   - Port: `5432` (use `6543` for connection pooling)
   - Database: `postgres`
   - User: `postgres`
   - Password: your project password

#### Option B: Local PostgreSQL

```bash
# Create database
createdb techvault

# Run schema
psql techvault < database/schema.sql
```

> **Important:** The schema creates a default admin user:
> - Email: `admin@techvault.com`
> - Password: `password` (bcrypt-hashed in seed)

---

### 2. Backend (Laravel)

#### Step 1: Scaffold Laravel

```bash
cd backend

# Install Laravel into the current directory
composer create-project laravel/laravel temp --prefer-dist
# Move Laravel scaffold files (the ones we don't have custom versions of)
# into backend/, then remove temp/
```

**Or**, if you prefer a clean approach:

```bash
# Create a fresh Laravel project elsewhere
composer create-project laravel/laravel techvault-api --prefer-dist

# Then copy our custom files INTO the scaffolded project:
# Copy: app/, config/fidelity.php, routes/api.php, bootstrap/app.php
```

#### Step 2: Install Dependencies

```bash
cd backend
composer install
```

Make sure these packages are installed (they come with Laravel 11):
- `laravel/sanctum` (API token authentication)

If not already present:
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

#### Step 3: Configure Environment

Create `.env` in the `backend/` directory:

```env
APP_NAME=TechVault
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database — Supabase
DB_CONNECTION=pgsql
DB_HOST=db.<your-project-ref>.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=<your-supabase-password>

# For Supabase: require SSL
DB_SSLMODE=require

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000

# Fidelity Program
FIDELITY_BASE_RATE=10
FIDELITY_POINT_VALUE=0.01
FIDELITY_EXPIRATION_DAYS=365
```

#### Step 4: Generate App Key & Run

```bash
php artisan key:generate
php artisan serve
```

The API is now running at `http://localhost:8000/api`

#### Step 5: Verify

```bash
# Test the products endpoint
curl http://localhost:8000/api/products

# Should return paginated product data from seed
```

---

### 3. Frontend (React)

#### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

#### Step 2: Configure API URL (optional)

The Vite config already proxies `/api` to `http://localhost:8000`. If your backend runs on a different port, update `vite.config.ts`:

```ts
proxy: {
  '/api': {
    target: 'http://localhost:8000',  // ← change this
    changeOrigin: true,
    secure: false,
  },
},
```

#### Step 3: Run

```bash
npm run dev
```

The frontend is now at `http://localhost:5173`

---

## Running Locally

Open **two terminals** side by side:

| Terminal 1 (Backend) | Terminal 2 (Frontend) |
|---|---|
| `cd backend` | `cd frontend` |
| `php artisan serve` | `npm run dev` |
| Runs on `:8000` | Runs on `:5173` |

The Vite dev server proxies all `/api/*` requests to the Laravel backend automatically.

---

## API Reference

### Public (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, returns token |
| `GET` | `/api/products` | List products (paginated, filterable) |
| `GET` | `/api/products/{slug}` | Get single product by slug |
| `GET` | `/api/categories` | List active categories |
| `GET` | `/api/cart` | Get cart items (session-based for guests) |
| `POST` | `/api/cart` | Add item to cart |
| `PATCH` | `/api/cart/{id}` | Update cart item quantity |
| `DELETE` | `/api/cart/{id}` | Remove cart item |

### Authenticated (Bearer Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/logout` | Revoke all tokens |
| `GET` | `/api/auth/user` | Get current user profile |
| `POST` | `/api/cart/merge` | Merge guest cart into user cart |
| `POST` | `/api/checkout` | Process checkout (pessimistic locking) |
| `GET` | `/api/orders` | List user's orders |
| `GET` | `/api/orders/{id}` | Get order details |
| `GET` | `/api/fidelity/balance` | Get fidelity point balance |
| `GET` | `/api/fidelity/history` | Get fidelity transaction history |
| `GET` | `/api/fidelity/tier` | Get current tier info |

### Admin (Bearer Token + Admin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/analytics` | Dashboard summary stats |
| `GET` | `/api/admin/analytics/revenue` | 30-day revenue data |
| `GET` | `/api/admin/analytics/low-stock` | Low stock variant alerts |
| `POST` | `/api/admin/products` | Create product with variants |
| `PUT` | `/api/admin/products/{id}` | Update product |
| `DELETE` | `/api/admin/products/{id}` | Delete product |
| `GET` | `/api/admin/orders` | List all orders (filterable) |
| `PATCH` | `/api/admin/orders/{id}/status` | Update order status |

---

## Deployment Guide

### Backend Deployment

#### Option A: Railway

1. **Push backend to a Git repo** (or use monorepo)
2. **Create a Railway project** at [railway.app](https://railway.app)
3. **Add a PostgreSQL database** (or connect your Supabase instance)
4. **Deploy from GitHub** — point to the `backend/` directory
5. **Set environment variables** in Railway dashboard (see [Environment Variables](#environment-variables-reference))
6. **Set start command**:
   ```
   php artisan serve --host=0.0.0.0 --port=$PORT
   ```
7. Railway auto-detects PHP and installs Composer dependencies

#### Option B: Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Set **Root Directory** to `backend`
3. **Build Command**: `composer install --no-dev --optimize-autoloader`
4. **Start Command**: `php artisan serve --host=0.0.0.0 --port=$PORT`
5. Set environment variables in the Render dashboard

#### Option C: Traditional VPS (DigitalOcean, Hetzner)

```bash
# 1. SSH into server
ssh user@your-server

# 2. Install dependencies
sudo apt update
sudo apt install php8.3 php8.3-pgsql php8.3-mbstring php8.3-xml php8.3-curl \
  composer nginx certbot python3-certbot-nginx

# 3. Clone repo & install
cd /var/www
git clone <your-repo> techvault
cd techvault/backend
composer install --no-dev --optimize-autoloader

# 4. Configure
cp .env.example .env
php artisan key:generate
# Edit .env with production DB credentials

# 5. Set permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# 6. Nginx config
sudo nano /etc/nginx/sites-available/techvault-api
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/techvault/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# 7. Enable & restart
sudo ln -s /etc/nginx/sites-available/techvault-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# 8. SSL (optional but recommended)
sudo certbot --nginx -d api.yourdomain.com

# 9. Optimize Laravel for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

### Frontend Deployment

#### Option A: Vercel (Recommended)

1. **Push frontend to GitHub**
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Set **Root Directory** to `frontend`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add environment variable:
   ```
   VITE_API_URL=https://api.yourdomain.com
   ```
7. **Configure rewrites** — create `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://api.yourdomain.com/api/:path*" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

#### Option B: Netlify

1. **Import from GitHub**
2. Set **Base directory**: `frontend`
3. **Build command**: `npm run build`
4. **Publish directory**: `frontend/dist`
5. Create `frontend/public/_redirects`:
   ```
   /api/*  https://api.yourdomain.com/api/:splat  200
   /*      /index.html                             200
   ```

#### Option C: Static hosting on VPS

```bash
cd frontend
npm run build

# Copy dist/ to your web server
scp -r dist/ user@server:/var/www/techvault-frontend/
```

**Nginx config for SPA:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/techvault-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### Frontend: Update API Base URL for Production

When deploying, update `frontend/src/lib/api.ts` to use the production API URL:

```ts
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // ...
});
```

Then set `VITE_API_URL` in your deployment platform's environment variables.

---

### Environment Variables Reference

#### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_KEY` | ✅ | — | Laravel encryption key (generated by `artisan key:generate`) |
| `APP_ENV` | ✅ | `local` | `local`, `staging`, or `production` |
| `APP_DEBUG` | ✅ | `true` | `false` in production |
| `APP_URL` | ✅ | — | Full backend URL |
| `DB_CONNECTION` | ✅ | `pgsql` | Must be `pgsql` |
| `DB_HOST` | ✅ | — | Database host |
| `DB_PORT` | ✅ | `5432` | Database port |
| `DB_DATABASE` | ✅ | — | Database name |
| `DB_USERNAME` | ✅ | — | Database user |
| `DB_PASSWORD` | ✅ | — | Database password |
| `DB_SSLMODE` | ❌ | `prefer` | Set to `require` for Supabase |
| `SANCTUM_STATEFUL_DOMAINS` | ✅ | — | Comma-separated frontend domains |
| `FIDELITY_BASE_RATE` | ❌ | `10` | Points per dollar spent |
| `FIDELITY_POINT_VALUE` | ❌ | `0.01` | Dollar value per point |
| `FIDELITY_EXPIRATION_DAYS` | ❌ | `365` | Days until points expire |

#### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ❌ | Production API base URL (defaults to `/api` for proxy) |

---

## Seed Data & Test Accounts

The `database/schema.sql` inserts:

| Entity | Details |
|--------|---------|
| **Admin user** | `admin@techvault.com` / `password` |
| **Categories** | Laptops, Smartphones, Audio, Accessories |
| **Products** | MacBook Pro M3, iPhone 15 Pro, Sony WH-1000XM5 |
| **Variants** | 6 total (16GB/32GB laptops, 256GB/512GB phones, etc.) |
| **Fidelity Tiers** | Bronze (0), Silver ($500), Gold ($2000) |

---

## Troubleshooting

### Frontend shows blank page
- Open browser DevTools → Console for errors
- Ensure `npm install` completed successfully
- Verify the backend is running (API proxy requires it for some pages)
- Check that no import/export mismatches exist

### CORS errors
Add your frontend URL to `SANCTUM_STATEFUL_DOMAINS` in `.env` and `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:5173', 'https://yourdomain.com'],
```

### Database connection failed
- Verify `DB_SSLMODE=require` for Supabase
- Check that your IP is allowed in Supabase → Settings → Database → Connection Pooling
- Use port `6543` if connection pooling is enabled

### "Route not defined" errors
```bash
php artisan route:clear
php artisan route:cache
php artisan route:list  # Verify all routes are registered
```

### Auth token issues
- Tokens are stored in `localStorage` as `auth_token`
- Clear `localStorage` to force re-login
- Verify `sanctum` middleware is correctly registered in `bootstrap/app.php`
