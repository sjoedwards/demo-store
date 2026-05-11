export const runtime = 'edge'

export async function GET() {
  const config = process.env.MISSING_EDGE_CONFIG
  if (!config) throw new Error('Required environment variable MISSING_EDGE_CONFIG is not defined.')
  return Response.json({ config })
}
