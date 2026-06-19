# Lumen API Reference

Base URL (development): `http://localhost:8000/api`
The React SPA calls the API at the relative path `/api` and Vite proxies it to
`http://localhost:8000` (see `frontend/vite.config.ts`).

**Auth:** Laravel Sanctum personal access tokens. After login/register the API
returns a `token`; send it on protected requests as:

```
Authorization: Bearer <token>
```

**Guest cart:** unauthenticated cart requests carry a client-generated UUID in the
`X-Session-Token` header. On login the guest cart is merged into the user's cart.

**Conventions**
- All resources are returned wrapped in a `data` key (Laravel API Resources).
- Paginated lists include a `meta` object: `{ current_page, last_page, per_page, total }`.
- Validation errors return `422` with `{ "message": ..., "errors": { field: [..] } }`.
- IDs are UUID strings.

---

## Authentication (Login / Signup pages)

| Method | Endpoint | Auth | Payload | Response |
|--------|----------|------|---------|----------|
| POST | `/auth/register` | – | `{ name, email, password, password_confirmation }` | `201 { user, token }` |
| POST | `/auth/login` | – | `{ email, password }` | `200 { user, token }` |
| POST | `/auth/logout` | ✅ | – | `204` |
| GET  | `/auth/user` | ✅ | – | `200 { user: { id, name, email, role, profile, fidelity_tier } }` |

Demo credentials (from the seeder): `admin@crm.dev / password` (admin),
`customer@crm.dev / password` (customer).

### Social login (OAuth — Google / GitHub)

| Method | Endpoint | Auth | Behaviour |
|--------|----------|------|-----------|
| GET | `/auth/{provider}/redirect` | – | 302 redirect to the provider (`provider` = `google` or `github`) |
| GET | `/auth/{provider}/callback` | – | Provider returns here; backend finds/creates the user, mints a Sanctum token, then 302s to `{FRONTEND_URL}/auth/callback?token=…` (or `?error=…`) |

These are full-page browser redirects, **not** XHR calls. Configure provider
credentials in `.env` (`GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`)
and run `composer require laravel/socialite` (already in `composer.json`).

---

## Catalog (Landing / Catalog page)

| Method | Endpoint | Auth | Query / Payload | Response |
|--------|----------|------|-----------------|----------|
| GET | `/products` | – | `?category=<slug>&search=<q>&page=<n>&per_page=<n>` | Paginated `Product[]` |
| GET | `/categories` | – | – | `{ data: Category[] }` (with `products_count`) |

`search` matches product name, short description and description (case-insensitive).

---

## Product Detail page

| Method | Endpoint | Auth | Payload | Response |
|--------|----------|------|---------|----------|
| GET | `/products/{slug}` | – | – | `{ data: Product }` with `category` + `variants[]` |

Each `variant` includes `price`, `compare_at_price`, `stock`, `is_in_stock`,
`is_low_stock`, and `attributes` (e.g. size/color).

---

## Cart page

All cart endpoints accept the `X-Session-Token` header for guests, or the
`Authorization` bearer token for logged-in users. They return the **full cart**.

| Method | Endpoint | Auth | Payload | Response |
|--------|----------|------|---------|----------|
| GET | `/cart` | optional | – | `{ data: CartItem[] }` |
| POST | `/cart` | optional | `{ variant_id, quantity }` | `201 { data: CartItem[] }` |
| PATCH | `/cart/{cartItem}` | optional | `{ quantity }` | `{ data: CartItem[] }` |
| DELETE | `/cart/{cartItem}` | optional | – | `{ data: CartItem[] }` |
| POST | `/cart/merge` | ✅ | `{ session_token }` | `{ message }` |

`CartItem` includes `variant`, `product_name`, `quantity`, and `line_total`.

---

## Checkout page

| Method | Endpoint | Auth | Payload | Response |
|--------|----------|------|---------|----------|
| POST | `/checkout` | ✅ | `{ shipping_name, shipping_address, shipping_city, shipping_state?, shipping_postal_code, shipping_country, fidelity_points_to_redeem?, notes? }` | `201 { data: Order }` |

The order is created atomically: stock is locked & decremented, totals
(`subtotal`, `fidelity_discount`, `tax` @ 8.25%, `total`) are computed,
fidelity points are redeemed/earned, the cart is cleared, and the loyalty tier
is recalculated. Insufficient stock returns `422` with a `stock` error.

---

## Customer Orders

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/orders` | ✅ | Paginated `Order[]` (own orders) |
| GET | `/orders/{order}` | ✅ | `{ data: Order }` (403 if not owner) |

---

## Fidelity (Loyalty) program

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/fidelity/balance` | ✅ | `{ data: { balance, tier{...}, recent_transactions[] } }` |
| GET | `/fidelity/history` | ✅ | Paginated `FidelityTransaction[]` |
| GET | `/fidelity/tier` | ✅ | `{ current_tier, lifetime_spend, next_tier }` |

---

## Admin Dashboard (admin role required)

Protected by `auth:sanctum` + the `admin` middleware.

### Analytics (stats / charts)
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/admin/analytics` | `{ data: { total_revenue, total_orders, active_fidelity_users, average_order_value } }` |
| GET | `/admin/analytics/revenue` | `{ data: [{ date, revenue, orders }] }` (last 30 days) |
| GET | `/admin/analytics/low-stock` | `{ data: [variant + product info] }` |

### Products management
| Method | Endpoint | Payload |
|--------|----------|---------|
| POST | `/admin/products` | `{ category_id, name, slug, description, short_description?, specifications?, image_url?, is_active?, variants:[{ sku, name, attributes?, price, compare_at_price?, stock, low_stock_threshold? }] }` |
| PUT | `/admin/products/{product}` | same as create (variants are replaced) |
| DELETE | `/admin/products/{product}` | – (409 if referenced by existing orders) |

### Orders management
| Method | Endpoint | Payload |
|--------|----------|---------|
| GET | `/admin/orders` | `?status=<status>&page=<n>` → paginated `Order[]` |
| PATCH | `/admin/orders/{order}/status` | `{ status }` — validated against the allowed state machine |

Order status transitions: `pending → confirmed/cancelled`,
`confirmed → processing/cancelled`, `processing → shipped`,
`shipped → delivered`. `delivered`/`cancelled` are terminal.

---

## Notes & deviations from the original brief
- Routes are served under `/api` (not `/api/v1`) to match the existing SPA's
  `axios` base URL. Add a version group later without breaking the client.
- This codebase is a focused loyalty-commerce app (products, variants, cart,
  checkout, orders, a Fidelity points program, and an admin dashboard). Modules
  from the generic brief that the frontend does not use (separate reviews,
  brands, coupons, address book, Stripe, newsletter) are intentionally **not**
  implemented to avoid unused/dead code. They can be added as the frontend grows.
