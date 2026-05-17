import { apiFetch } from '@/lib/api-fetch'

export async function GET() {
  const res = await apiFetch('/api/ping')
  if (!res.ok) throw new Error('Health check failed.')
  return Response.json({ status: 'ok' })
}
