export const runtime = 'edge'

export async function GET() {
  const secret = process.env.REVALIDATION_SECRET
  if (!secret) throw new Error('REVALIDATION_SECRET is not set')
  return Response.json({ ok: true })
}
