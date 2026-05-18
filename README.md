# demo-store

A deliberately broken Next.js storefront used to generate realistic error traffic for the [agentic-triage-demo](https://github.com/sjoedwards/agentic-triage-demo) project.

The app calls `demo-store-api` as its upstream service. Errors are split across both repos: bugs that a code-reading agent can find live in **this repo**; smoke-and-mirrors chaos (artificial delays, rate limiters) lives in **demo-store-api**.

**Production URL:** https://demo-store-lilac.vercel.app  
**Upstream API:** https://demo-store-api.vercel.app

---

## Architecture

```
Browser / Playwright
      │
      ▼
demo-store  (this repo — Next.js, Vercel)
      │  POST /api/checkout   → lib/pricing.ts (broken discount math)
      │  GET  /api/products   → demo-store-api /api/products
      │  GET  /api/search     → demo-store-api /api/search
      │  GET  /api/health     → demo-store-api /api/ping
      │  POST /api/mock-payment → demo-store-api /api/mock-payment
      ▼
demo-store-api  (upstream — chaos flags live here)
```

---

## Error catalogue

13 deliberately injected errors across two categories:

### Always-on (no env flag needed)

| # | Error | Route | File |
|---|---|---|---|
| 2 | Pricing regression — `applyDiscount()` subtracts wrong way, negative total | `POST /api/checkout` | `lib/pricing.ts:7` |
| 4 | Order FK violation — references deleted `productId` | `POST /api/orders` | `app/api/orders/route.ts:11` |
| 5 | Missing edge env var — `MISSING_EDGE_CONFIG` never set | `GET /api/edge` | `app/api/edge/route.ts:5` |

### Flag-gated (set env var to `1` to enable)

| # | Error | Env flag | Route | File |
|---|---|---|---|---|
| 1 | Stripe idempotency missing — `Idempotency-Key` header omitted | `FAULT_STRIPE_IDEMPOTENCY` (**demo-store-api**) | `POST /api/checkout` | `app/api/checkout/route.ts:15` |
| 3 | Auth race condition — 60ms sleep between session check and write | `FAULT_AUTH_RACE` (**demo-store-api**) | `POST /api/auth` | `app/api/auth/route.ts:7` |
| 6 | Health check noise — upstream 500 logged with no context | `FAULT_HEALTH` (**demo-store-api**) | `GET /api/health` | `app/api/health/route.ts:6` |
| 7 | Silent search failure — stack swallowed, root cause invisible | `FAULT_SEARCH_SILENT` (**demo-store-api**) | `GET /api/search` | `app/api/search/route.ts:12` |
| 8 | Cart null dereference — `cart!.items` crashes when API returns null cart | `FAULT_CART_NULL` (**demo-store-api**) | `POST /api/cart` | `app/api/cart/route.ts:13` |
| 9 | Checkout price override — trusts client-supplied `subtotalPence` | `FAULT_PRICE_OVERRIDE` (this repo) | `POST /api/checkout-price` | `app/api/checkout-price/route.ts:6` |
| 10 | Orphaned guest orders — order created with `sessionId: null` | `FAULT_GUEST_ORDERS` (**demo-store-api**) | `POST /api/guest-orders` | `app/api/guest-orders/route.ts:11` |
| 11 | Upstream products timeout — no `AbortSignal.timeout()`, upstream delays 12s | `FAULT_UPSTREAM_TIMEOUT` (**demo-store-api**) | `GET /api/products` | `app/api/products/route.ts:6` |
| 12 | Rate limit cascade — no retry on 429 from upstream | `FAULT_UPSTREAM_RATE_LIMIT` (**demo-store-api**) | `GET /api/products` | `app/api/products/route.ts:7` |
| 13 | N+1 enrichment — per-product call to `/api/products/:id` which doesn't exist, 4 upstream 404s per page load | — (always-on) | `GET /api/products` | `app/api/products/route.ts:11` |

---

## Auth

Two independent layers enforced in `middleware.ts`:

| Layer | Mechanism | Routes | Env vars |
|---|---|---|---|
| 1 | HTTP Basic Auth | All routes (including storefront) | `BASIC_USER`, `BASIC_PASS` |
| 2 | Bearer token **or** `x-e2e-token` header | Cron-only API routes (`/api/orders`, `/api/edge`, `/api/health`, `/api/checkout-price`, `/api/guest-orders`) | `E2E_TOKEN` |

UI-safe routes (`/api/cart`, `/api/auth`, `/api/search`, `/api/checkout`, `/api/products`) are exempt from layer 2.

The `x-e2e-token` header is an alternative to `Authorization: Bearer` for layer 2, added so browser-context fetches (which use `Authorization` for Basic Auth) can still reach cron-only routes.

---

## Generating errors

### Via the UI (manual or Playwright)

| Action | Errors triggered |
|---|---|
| Click **Checkout** twice, 50ms apart | #1 (idempotency), #2 (pricing) |
| Click **Sign in** twice, 50ms apart | #3 (auth race) |
| Click **Add to cart** (no session token) | #8 (null dereference) |
| Submit the **Search** form | #7 (silent search failure) |

### Via the Playwright script (automated)

A standalone Playwright test suite in `e2e/` triggers all 12 errors:

```bash
cd e2e
npm install
npx playwright install chromium   # first time only
npm run generate-errors            # headless
npm run generate-errors:headed     # with browser visible
```

**Environment variables** (all optional — production defaults are baked in):

| Variable | Default | Description |
|---|---|---|
| `STORE_URL` | `https://demo-store-lilac.vercel.app` | Base URL of the store |
| `BASIC_USER` | `sjoedwards` | Basic Auth username |
| `BASIC_PASS` | `ubq5PTK@mxb9day8hpe` | Basic Auth password |
| `E2E_TOKEN` | *(see .env.local)* | Bearer token for cron-only routes |

### Via the GitHub Actions cron

`.github/workflows/e2e.yml` runs hourly and fires all routes using `curl`. Requires `STORE_URL` and `E2E_TOKEN` set as GitHub secrets.

---

## Local development

```bash
cp .env.example .env.local
# fill in API_URL=http://localhost:3001 and leave auth vars empty for local dev
npm install
npm run dev
```

Requires `demo-store-api` running on port 3001 for products, search, health, and payment routes.

---

## Environment variables

See `.env.example` for the full list. Key vars:

| Variable | Description |
|---|---|
| `API_URL` | Base URL of demo-store-api |
| `BASIC_USER` / `BASIC_PASS` | Basic Auth credentials (leave empty in local dev) |
| `API_SECRET` | Bearer token for calls **to** demo-store-api |
| `E2E_TOKEN` | Bearer token protecting cron-only routes **on** this app |
| `FAULT_PRICE_OVERRIDE` | Enable error #9 |
