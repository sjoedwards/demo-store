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
 *   STORE_URL    Base URL of the store  (default: https://demo-store-lilac.vercel.app)
 *   BASIC_USER   Basic Auth username
 *   BASIC_PASS   Basic Auth password
 *   E2E_TOKEN    Token for internal API routes
 */

import { expect, test } from '@playwright/test'

const E2E_TOKEN = process.env.E2E_TOKEN ?? 'efa7efn!qwj-MPR!kwc'
const cronHeaders = { 'x-e2e-token': E2E_TOKEN }

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
    const result = await page.evaluate(
      async ({ headers }) => {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ productId: 'prod-3f4a1c', qty: 1 }),
        })
        return { status: res.status, body: await res.text() }
      },
      { headers: cronHeaders },
    )
    logResult('orders', result.status, result.body)
    expect(result.status).toBe(500)
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
    expect(result.status).toBe(500)
  })

  test('Product listing', async ({ page }) => {
    const results = await page.evaluate(async () => {
      const out = []
      for (let i = 1; i <= 3; i++) {
        const res = await fetch('/api/products')
        out.push({ call: i, status: res.status })
      }
      return out
    })
    for (const r of results) {
      logResult(`products (call ${r.call})`, r.status, '')
    }
    expect(results.some((r) => r.status !== 200)).toBe(true)
  })
})
