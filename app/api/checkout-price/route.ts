export async function POST(req: Request) {
  if (process.env.FAULT_PRICE_OVERRIDE !== '1') {
    return Response.json({ message: 'Price override fault not enabled' }, { status: 400 })
  }
  const { subtotalPence, productId } = await req.json()
  // BUG: trusts client-supplied subtotalPence with no server-side price lookup
  return Response.json({ orderId: crypto.randomUUID(), total: subtotalPence })
}
