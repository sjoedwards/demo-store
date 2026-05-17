const carts = new Map<string, { items: Array<{ productId: string; qty: number }> }>()

export async function POST(req: Request) {
  const { productId, qty } = await req.json()
  const token = req.headers.get('x-session-token') ?? ''
  const cart = carts.get(token)

  cart!.items.push({ productId, qty })

  return Response.json({ success: true })
}
