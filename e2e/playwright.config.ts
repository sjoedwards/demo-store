import { defineConfig } from '@playwright/test'

// This script is for local use only — it generates traffic against the live store.
// It is intentionally not wired into CI.
if (process.env.CI) {
  throw new Error('generate-errors.spec.ts is a local traffic generator and must not run in CI.')
}

export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  use: {
    baseURL: process.env.STORE_URL ?? 'https://demo-store-lilac.vercel.app',
    httpCredentials: {
      username: process.env.BASIC_USER ?? 'sjoedwards',
      password: process.env.BASIC_PASS ?? 'ubq5PTK@mxb9day8hpe',
    },
  },
  reporter: [['list'], ['html', { open: 'never' }]],
})
