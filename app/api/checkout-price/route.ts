export async function POST(req: Request) {
  const { subtotalPence, productId } = await req.json()
  return Response.json({ orderId: crypto.randomUUID(), total: subtotalPence })
}
