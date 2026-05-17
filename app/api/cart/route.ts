import { apiFetch } from '@/lib/api-fetch'

export async function POST(req: Request) {
  const { productId, qty } = await req.json()
  const token = req.headers.get('x-session-token') ?? ''

  const res = await apiFetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, productId, qty }),
  })

  const { cart } = await res.json()
  cart.items.push({ productId, qty })

  return Response.json({ success: true })
}
