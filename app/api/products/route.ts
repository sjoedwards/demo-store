import { apiFetch } from '@/lib/api-fetch'

export const maxDuration = 10

export async function GET() {
  const res = await apiFetch('/api/products')
  if (!res.ok) throw new Error(`Upstream returned ${res.status} ${res.statusText}. No retry configured.`)
  return Response.json(await res.json())
}
