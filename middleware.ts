import { NextRequest, NextResponse } from 'next/server'

// Protect all /api/* routes with a bearer token.
// The storefront page (/) is public.
// Set E2E_TOKEN in Vercel env vars — same value goes into GitHub secret E2E_TOKEN.

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const token = process.env.E2E_TOKEN
  if (!token) {
    // No token configured — allow through (local dev without env var set)
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
