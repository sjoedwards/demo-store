import { apiFetch } from '@/lib/api-fetch'

export async function POST(req: Request) {
  const { subtotalPence, items } = await req.json()

  const discountRes = await apiFetch('/api/discount', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subtotalPence }),
  })
  const { total } = await discountRes.json()
  if (total < 0) throw new Error(`Invalid order total: ${total}`)

  const payment = await apiFetch('/api/mock-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({ amount: total }),
  })
  if (!payment.ok) throw new Error((await payment.json()).error)

  return Response.json({ success: true })
}
