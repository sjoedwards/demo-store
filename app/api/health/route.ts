export async function GET() {
  const res = await fetch(`${process.env.API_URL}/api/ping`)
  if (!res.ok) {
    // BUG: no diagnostic context logged — root cause invisible
    throw new Error('Health check failed.')
  }
  return Response.json({ status: 'ok' })
}
