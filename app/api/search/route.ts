import { apiFetch } from '@/lib/api-fetch'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''

  try {
    const res = await apiFetch(`/api/search?q=${q}`)
    if (!res.ok) throw new Error(`Search API error: ${res.status}`)
    return Response.json(await res.json())
  } catch (e) {
    // BUG: stack swallowed — root cause invisible
    console.error('Search failed.')
    return Response.json({ results: [] }, { status: 500 })
  }
}
