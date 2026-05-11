const carts = new Map<string, { items: Array<{ productId: string; qty: number }> }>()

export async function POST(req: Request) {
  const { productId, qty } = await req.json()
  const token = req.headers.get('x-session-token') ?? ''
  const cart = carts.get(token)

  if (process.env.CHAOS_CART_NULL === '1') {
    cart!.items.push({ productId, qty }) // BUG: cart is undefined when token missing
  } else {
    const safe = cart ?? { items: [] }
    safe.items.push({ productId, qty })
    carts.set(token, safe)
  }

  return Response.json({ success: true })
}
