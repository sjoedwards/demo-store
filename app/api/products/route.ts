export const maxDuration = 10

export async function GET() {
  const res = await fetch(`${process.env.API_URL}/api/products`)
  if (!res.ok) throw new Error(`Upstream returned ${res.status} ${res.statusText}. No retry configured.`)
  return Response.json(await res.json())
}
