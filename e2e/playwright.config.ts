import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  timeout: 60_000, // /api/products can take up to 12s (upstream timeout fault)
  use: {
    baseURL: process.env.STORE_URL ?? 'https://demo-store-lilac.vercel.app',
    // Basic Auth credentials — set BASIC_USER / BASIC_PASS or rely on .env.local defaults
    httpCredentials: {
      username: process.env.BASIC_USER ?? 'sjoedwards',
      password: process.env.BASIC_PASS ?? 'ubq5PTK@mxb9day8hpe',
    },
  },
  reporter: [['list'], ['html', { open: 'never' }]],
})
