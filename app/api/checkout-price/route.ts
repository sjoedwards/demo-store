import { apiFetch } from '@/lib/api-fetch'

export async function POST(req: Request) {
  const { subtotalPence, productId } = await req.json()

  const res = await apiFetch('/api/checkout-price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subtotalPence, productId }),
  })

  return Response.json(await res.json())
}
