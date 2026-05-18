/**
 * generate-errors.spec.ts
 *
 * Simulates realistic user and system traffic against the demo-store.
 * Covers the full purchase funnel: browse → search → sign in → cart → checkout,
 * plus background API calls (orders, health, edge config, guest checkout).
 *
 * Run from the e2e/ directory:
 *
 *   npm install
 *   npx playwright install chromium
 *   npm run generate-errors
 *
 * Environment variables (all optional — defaults target production):
 *   STORE_URL    Base URL of the store  (default: https://demo-store.playground-vercel.tools)
 *   BYPASS_KEY   Vercel protection bypass key
 *   E2E_TOKEN    Token for internal API routes
 */

import { expect, test } from '@playwright/test'

const E2E_TOKEN = process.env.E2E_TOKEN ?? 'efa7efn!qwj-MPR!kwc'
const BYPASS_KEY = process.env.BYPASS_KEY ?? 'u2KmxEBO4IN1VDGp2UeifOI02jPUCoDQ'

// Headers for cron-only routes (layer 2 auth + bypass)
const cronHeaders = {
  'x-e2e-token': E2E_TOKEN,
  'x-vercel-protection-bypass': BYPASS_KEY,
}

function logResult(label: string, status: number, body: string) {
  const truncated = body.length > 120 ? body.slice(0, 120) + '…' : body
  console.log(`  ${label.padEnd(28)} → HTTP ${status}  ${truncated}`)
}

test.describe('Store traffic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Demo Store' })).toBeVisible()
  })

  test('Checkout flow', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: 'Checkout' })
    await checkoutBtn.click()
    await page.waitForTimeout(50)
    await checkoutBtn.click()
    await page.waitForTimeout(500)
  })

  test('Sign in', async ({ page }) => {
    await page.fill('#email-input', 'test@example.com')
    const signInBtn = page.getByRole('button', { name: 'Sign in' })
    await signInBtn.click()
    await page.waitForTimeout(50)
    await signInBtn.click()
    await page.waitForTimeout(500)
  })

  test('Add to cart', async ({ page }) => {
    await page.getByRole('listitem').filter({ hasText: 'Classic Tee' }).getByRole('button').click()
    await page.waitForTimeout(500)
  })

  test('Search', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search products...' }).fill('test')
    await page.getByRole('button', { name: 'Search' }).click()
    await page.waitForURL('**/api/search**')
    await page.goBack()
    await expect(page.getByRole('heading', { name: 'Demo Store' })).toBeVisible()
  })

  test('Submit order', async ({ page }) => {
    const results = await page.evaluate(
      async ({ headers }) => {
        const stale = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ productId: 'prod-3f4a1c', qty: 1 }),
        })
        const valid = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ productId: 'prod-001', qty: 1 }),
        })
        return [
          { label: 'orders (stale id)', status: stale.status, body: await stale.text() },
          { label: 'orders (valid id)', status: valid.status, body: await valid.text() },
        ]
      },
      { headers: cronHeaders },
    )
    for (const r of results) logResult(r.label, r.status, r.body)
    expect(results[0].status).toBe(500)
    expect(results[1].status).toBe(500)
  })

  test('Edge config check', async ({ page }) => {
    const result = await page.evaluate(
      async ({ headers }) => {
        const res = await fetch('/api/edge', { headers })
        return { status: res.status, body: await res.text() }
      },
      { headers: cronHeaders },
    )
    logResult('edge', result.status, result.body)
    expect(result.status).toBe(500)
  })

  test('Health check', async ({ page }) => {
    const result = await page.evaluate(
      async ({ headers }) => {
        const res = await fetch('/api/health', { headers })
        return { status: res.status, body: await res.text() }
      },
      { headers: cronHeaders },
    )
    logResult('health', result.status, result.body)
    expect(result.status).toBe(500)
  })

  test('Checkout price lookup', async ({ page }) => {
    const result = await page.evaluate(
      async ({ headers }) => {
        const res = await fetch('/api/checkout-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ subtotalPence: 1, productId: 'prod-001' }),
        })
        return { status: res.status, body: await res.text() }
      },
      { headers: cronHeaders },
    )
    logResult('checkout-price', result.status, result.body)
    expect(result.status).toBe(200)
  })

  test('Guest checkout', async ({ page }) => {
    const result = await page.evaluate(
      async ({ headers }) => {
        const res = await fetch('/api/guest-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ productId: 'prod-002', qty: 1 }),
        })
        return { status: res.status, body: await res.text() }
      },
      { headers: cronHeaders },
    )
    logResult('guest-orders', result.status, result.body)
  })

  test('Product listing', async ({ page }) => {
    const results = await page.evaluate(
      async ({ bypassKey }) => {
        const out = []
        for (let i = 1; i <= 3; i++) {
          const res = await fetch('/api/products', {
            headers: { 'x-vercel-protection-bypass': bypassKey },
          })
          out.push({ call: i, status: res.status })
        }
        return out
      },
      { bypassKey: BYPASS_KEY },
    )
    for (const r of results) {
      logResult(`products (call ${r.call})`, r.status, '')
    }
    expect(results.some((r) => r.status !== 200)).toBe(true)
  })
})
