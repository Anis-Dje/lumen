# Connecting the React SPA to the Lumen API

The frontend (`/frontend`, Vite + React + TypeScript + Zustand) is already wired
to this backend. This document explains how the pieces fit together so you can
run both locally or point the SPA at a deployed API.

## 1. Base URL & dev proxy

`frontend/src/lib/api.ts` creates an axios instance with `baseURL: '/api'`.
In development, `frontend/vite.config.ts` proxies `/api` to the Laravel server:

```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
  },
},
```

So with `php artisan serve` (port 8000) and `npm run dev` (port 5173) running,
the SPA reaches the API with **no CORS issues** because requests are same-origin
to Vite, which forwards them.

**Pointing at a deployed API:** either keep the proxy and change its `target`,
or set `baseURL` in `api.ts` to the full API origin and rely on CORS (configured
below).

## 2. Auth token handling

- On `login`/`register` the API returns `{ user, token }`.
- The `authStore` saves the token to `localStorage` under `auth_token`.
- The axios **request interceptor** attaches `Authorization: Bearer <token>` to
  every request.
- The axios **response interceptor** clears the token and redirects to `/login`
  on any `401`.

No cookies are required — this is pure token auth via Sanctum personal access
tokens.

## 3. Guest cart & merge-on-login

- `cartStore` generates a UUID (`crypto.randomUUID()`), stores it in
  `localStorage` as `cart_session_token`, and sends it as the `X-Session-Token`
  header on cart calls.
- After login, call `cartStore.mergeCart()` which POSTs `/cart/merge` with the
  guest `session_token`; the backend folds guest items into the user's cart and
  the client drops the guest token.

## 4. CORS (separate origins)

If you serve the SPA from a different origin than the API (i.e. not using the
Vite proxy), set `FRONTEND_URL` in the backend `.env` and the included
`backend/config/cors.php` will allow it:

```
FRONTEND_URL=https://app.yourdomain.com
SANCTUM_STATEFUL_DOMAINS=app.yourdomain.com
```

`config/cors.php` allows `api/*` for the configured origin(s), all methods and
headers (including `Authorization` and `X-Session-Token`).

## 4b. Social login (OAuth)

"Continue with Google / GitHub" buttons (`src/components/ui/OAuthButtons.tsx`)
navigate the browser to `${API}/auth/{provider}/redirect`. The backend
(Laravel Socialite, stateless) handles the provider handshake and redirects back
to `/auth/callback?token=…`, which `OAuthCallbackPage` consumes — it stores the
token, fetches the user, and routes home.

Backend setup:
1. `composer require laravel/socialite` (already declared in `composer.json`).
2. Create OAuth apps (Google Cloud Console / GitHub Developer settings) and set
   `GOOGLE_CLIENT_ID/SECRET` and `GITHUB_CLIENT_ID/SECRET` in `.env`. The
   authorized redirect URIs must match `{APP_URL}/api/auth/{provider}/callback`.
3. Ensure `FRONTEND_URL` in `.env` points at the SPA so the callback can return
   the token to the right origin.

For separate-origin deploys, set `VITE_API_URL` in the frontend `.env` to the
full API origin so the OAuth buttons hit the right host.

## 4c. Landing hero video (optional)

The hero (`src/components/landing/HeroSection.tsx`) shows an always-on animated
"tech constellation" canvas. To layer a looping video on top, drop an MP4 at
`frontend/public/hero.mp4` — it auto-plays muted/looping and gracefully falls
back to the canvas if the file is absent.

## 5. Response shapes the SPA expects

- Single resources: `{ data: {...} }`
- Lists: paginated `{ data: [...], meta: { current_page, last_page, per_page, total } }`
  or plain `{ data: [...] }` for categories/cart.
- `ProductVariant` exposes `is_in_stock` / `is_low_stock` booleans used by the UI.
- Errors: `{ message, errors? }` with proper HTTP status codes.

These match the TypeScript interfaces in `frontend/src/types/index.ts`.

## 6. Running both locally

```bash
# Backend
cd backend
cp .env.example .env
# set your MySQL credentials in .env (or set DB_CONNECTION=sqlite + touch database/database.sqlite)
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve            # http://localhost:8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

Log in with the seeded accounts (`admin@crm.dev` / `customer@crm.dev`,
password `password`) and the catalog, cart, checkout, orders, fidelity, and
admin dashboard are all live against real data.
