const PRODUCTS = new Map([
  ['prod-001', { name: 'Classic Tee', pricePence: 2500 }],
  ['prod-002', { name: 'Ceramic Mug', pricePence: 1200 }],
  ['prod-003', { name: 'Tote Bag', pricePence: 1800 }],
  ['prod-004', { name: 'Desk Plant', pricePence: 3200 }],
])

export async function POST(req: Request) {
  const { productId, qty } = await req.json()
  if (!PRODUCTS.has(productId)) {
    throw new Error(`Product not found: ${productId}`)
  }
  const product = PRODUCTS.get(productId)!
  return Response.json({ orderId: crypto.randomUUID(), total: product.pricePence * qty })
}
