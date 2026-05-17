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
    baseURL: process.env.STORE_URL ?? 'https://demo-store.playground-vercel.tools',
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': process.env.BYPASS_KEY ?? 'u2KmxEBO4IN1VDGp2UeifOI02jPUCoDQ',
    },
  },
  reporter: [['list'], ['html', { open: 'never' }]],
})

