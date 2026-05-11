const orders: Array<{ id: string; sessionId: string | null; productId: string; qty: number }> = []

export async function POST(req: Request) {
  if (process.env.CHAOS_GUEST_ORDERS !== '1') {
    return Response.json({ message: 'Guest orders chaos not enabled' }, { status: 400 })
  }
  const { productId, qty } = await req.json()
  // BUG: no session required — creates order with null sessionId, unreconcilable
  const order = { id: crypto.randomUUID(), sessionId: null, productId, qty }
  orders.push(order)
  throw new Error(
    `Order ${order.id} created with null session. Cannot reconcile to customer for refunds or disputes.`
  )
}
