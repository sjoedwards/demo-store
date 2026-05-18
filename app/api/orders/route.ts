import { apiFetch } from '@/lib/api-fetch'

export async function POST(req: Request) {
  const { productId, qty } = await req.json()

  const res = await apiFetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, qty }),
  })

  if (!res.ok) throw new Error((await res.json()).error)
  return Response.json(await res.json())
}
