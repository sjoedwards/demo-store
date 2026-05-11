// Wrapper around fetch that injects the API_SECRET bearer token for calls
// to demo-store-api. All other options pass through unchanged.

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const secret = process.env.API_SECRET ?? ''
  const headers = new Headers(init?.headers)
  if (secret) headers.set('Authorization', `Bearer ${secret}`)
  return fetch(`${process.env.API_URL}${path}`, { ...init, headers })
}
