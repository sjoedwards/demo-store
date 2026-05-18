import { apiFetch } from '@/lib/api-fetch'

export const runtime = 'edge'

export async function GET() {
  const res = await apiFetch('/api/config')
  if (!res.ok) throw new Error((await res.json()).error)
  return Response.json({ ok: true })
}
