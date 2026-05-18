# demo-store

A Next.js storefront that calls `demo-store-api` as its upstream service.

**Production URL:** https://demo-store-lilac.vercel.app  
**Upstream API:** https://demo-store-api.vercel.app

---

## Architecture

```
Browser / Playwright
      │
      ▼
demo-store  (this repo — Next.js, Vercel)
      │  POST /api/checkout      → demo-store-api /api/discount + /api/mock-payment
      │  GET  /api/products      → demo-store-api /api/products
      │  GET  /api/search        → demo-store-api /api/search
      │  GET  /api/health        → demo-store-api /api/ping
      │  POST /api/cart          → demo-store-api /api/cart
      │  POST /api/auth          → demo-store-api /api/sessions
      │  POST /api/orders        → demo-store-api /api/orders
      │  POST /api/guest-orders  → demo-store-api /api/guest-orders
      │  POST /api/checkout-price→ demo-store-api /api/checkout-price
      │  GET  /api/edge          → demo-store-api /api/config
      ▼
demo-store-api  (upstream)
```

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

## Generating traffic

### Via the Playwright script (automated)

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

Requires `demo-store-api` running on port 3001.

---

## Environment variables

| Variable | Description |
|---|---|
| `API_URL` | Base URL of demo-store-api |
| `BASIC_USER` / `BASIC_PASS` | Basic Auth credentials (leave empty in local dev) |
| `API_SECRET` | Bearer token for calls **to** demo-store-api |
| `E2E_TOKEN` | Bearer token protecting cron-only routes **on** this app |
