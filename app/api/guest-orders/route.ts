const orders: Array<{ id: string; sessionId: string | null; productId: string; qty: number }> = []

export async function POST(req: Request) {
  const { productId, qty } = await req.json()
  const order = { id: crypto.randomUUID(), sessionId: null, productId, qty }
  orders.push(order)
  throw new Error(`Failed to complete order ${order.id}`)
}
