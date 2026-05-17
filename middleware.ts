import { NextRequest, NextResponse } from 'next/server'

// Two separate auth layers:
//
// 1. BASIC AUTH (all routes including the storefront)
//    Set BASIC_USER and BASIC_PASS in Vercel env vars.
//    Browsers will show a native login prompt.
//    Leave both empty in local dev to skip.
//
// 2. E2E_TOKEN (cron-only /api/* routes — skipped for UI routes)
//    GitHub Actions cron passes: Authorization: Bearer <E2E_TOKEN>
//    UI routes are excluded — they're covered by basic auth instead.

const UI_API_ROUTES = [
  '/api/cart',
  '/api/auth',
  '/api/search',
  '/api/checkout',
  '/api/products',
]

function unauthorizedBasic() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Demo Store", charset="UTF-8"' },
  })
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const basicUser = process.env.BASIC_USER
  const basicPass = process.env.BASIC_PASS

  // --- Layer 1: Basic auth on all routes ---
  if (basicUser && basicPass) {
    const auth = req.headers.get('authorization') ?? ''
    if (!auth.startsWith('Basic ')) return unauthorizedBasic()

    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8')
    const [user, ...rest] = decoded.split(':')
    const pass = rest.join(':')

    if (user !== basicUser || pass !== basicPass) return unauthorizedBasic()
  }

  // --- Layer 2: Bearer token on cron-only API routes ---
  // Accepts either Authorization: Bearer <token> OR x-e2e-token: <token>
  // The x-e2e-token header allows browser-context fetches that already satisfy
  // layer 1 via Basic Auth (which occupies the Authorization header).
  if (path.startsWith('/api') && !UI_API_ROUTES.some(r => path.startsWith(r))) {
    const e2eToken = process.env.E2E_TOKEN
    if (e2eToken) {
      const auth = req.headers.get('authorization') ?? ''
      const bearerProvided = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      const headerProvided = req.headers.get('x-e2e-token') ?? ''
      const provided = bearerProvided || headerProvided
      if (provided !== e2eToken) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
