import { apiFetch } from '@/lib/api-fetch'

export const maxDuration = 10

export async function GET() {
  const res = await apiFetch('/api/products')
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
  const { products } = await res.json()

  // Enrich each product with extended details
  await Promise.all(
    products.map((p: { id: string }) => apiFetch(`/api/products/${p.id}`))
  )

  return Response.json({ products })
}
