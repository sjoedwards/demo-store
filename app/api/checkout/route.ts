import { applyDiscount } from '@/lib/pricing'

export async function POST(req: Request) {
  const { subtotalPence, items } = await req.json()

  const total = applyDiscount(subtotalPence)
  if (total < 0) {
    throw new Error(
      `Order total cannot be negative. Got: ${(total / 100).toFixed(2)} for subtotal: ${(subtotalPence / 100).toFixed(2)}`
    )
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.CHAOS_STRIPE_IDEMPOTENCY !== '1') {
    headers['Idempotency-Key'] = crypto.randomUUID()
  }
  // BUG when CHAOS_STRIPE_IDEMPOTENCY=1: Idempotency-Key header is omitted

  const payment = await fetch(`${process.env.API_URL}/api/mock-payment`, {
    method: 'POST', headers, body: JSON.stringify({ amount: total }),
  })
  if (!payment.ok) throw new Error((await payment.json()).error)

  return Response.json({ success: true })
}
