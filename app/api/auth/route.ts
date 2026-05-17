import { apiFetch } from '@/lib/api-fetch'

export async function POST(req: Request) {
  const { email } = await req.json()

  const res = await apiFetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  const { token } = await res.json()
  return Response.json({ token })
}
