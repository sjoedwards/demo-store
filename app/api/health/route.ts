import { apiFetch } from '@/lib/api-fetch'

export async function GET() {
  const res = await apiFetch('/api/ping')
  if (!res.ok) {
    // BUG: no diagnostic context logged — root cause invisible
    throw new Error('Health check failed.')
  }
  return Response.json({ status: 'ok' })
}
