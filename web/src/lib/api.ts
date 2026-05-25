const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options

  // TODO(logto): inject `Authorization: Bearer ${accessToken}` here once
  // Logto is wired up. Until then the backend should allow anonymous access
  // or expose dev-only endpoints behind a feature flag.
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    throw new ApiError(
      `Request failed: ${res.status} ${res.statusText}`,
      res.status,
      errorBody,
    )
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
