// Wrapper around fetch that injects the API_SECRET bearer token for calls
// to demo-store-api. All other options pass through unchanged.

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  let base = process.env.API_URL ?? ''
  if (base && !base.startsWith('http')) base = `https://${base}`
  const secret = process.env.API_SECRET ?? ''
  const bypass = process.env.API_BYPASS_KEY ?? ''
  const headers = new Headers(init?.headers)
  if (secret) headers.set('Authorization', `Bearer ${secret}`)
  if (bypass) headers.set('x-vercel-protection-bypass', bypass)
  return fetch(`${base}${path}`, { ...init, headers })
}
