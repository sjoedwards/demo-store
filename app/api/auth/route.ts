const sessions = new Map<string, string>()

export async function POST(req: Request) {
  const { email } = await req.json()
  const token = crypto.randomUUID()

  const exists = sessions.has(token)
  await new Promise(r => setTimeout(r, 60))
  if (exists) throw new Error(`Session already exists for token ${token}`)

  sessions.set(token, email)
  return Response.json({ token })
}
