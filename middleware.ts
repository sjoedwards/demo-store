import { NextRequest, NextResponse } from 'next/server'

// Routes callable from the browser UI — no auth required.
const PUBLIC_API_ROUTES = [
  '/api/cart',
  '/api/auth',
  '/api/search',
  '/api/checkout',
  '/api/products',
]

// All other /api/* routes are cron-only — protected by E2E_TOKEN bearer auth.
// Set E2E_TOKEN in Vercel env vars + GitHub secret E2E_TOKEN.

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  if (!path.startsWith('/api')) return NextResponse.next()

  // Public UI routes — allow through
  if (PUBLIC_API_ROUTES.some(r => path.startsWith(r))) {
    return NextResponse.next()
  }

  const token = process.env.E2E_TOKEN
  if (!token) {
    // No token configured — allow through (local dev)
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization') ?? ''
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : ''

  if (provided !== token) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
