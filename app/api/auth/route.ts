const sessions = new Map<string, string>()

export async function POST(req: Request) {
  const { email } = await req.json()
  const token = crypto.randomUUID()

  if (process.env.FAULT_AUTH_RACE === '1') {
    const exists = sessions.has(token)
    await new Promise(r => setTimeout(r, 60)) // BUG: race window between check and write
    if (exists) throw new Error(
      `Session creation failed — duplicate token conflict.\nDetail: Key (token)=(${token}) already exists.`
    )
  }

  sessions.set(token, email)
  return Response.json({ token })
}
