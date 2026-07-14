const USER_KEY = 'publicId'

function getStoredUserId(): string | null {
  return localStorage.getItem(USER_KEY)
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const publicId = getStoredUserId()
  if (publicId) {
    headers['X-User-Id'] = publicId
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }

  const json = await res.json()
  return json.data as T
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function apiGet<T>(url: string): Promise<T> {
  return apiFetch<T>(url)
}

export async function apiDelete(url: string): Promise<void> {
  const headers: Record<string, string> = {}
  const publicId = getStoredUserId()
  if (publicId) {
    headers['X-User-Id'] = publicId
  }
  const res = await fetch(url, { method: 'DELETE', headers })
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
}

export function getUserIdHeader(): Record<string, string> {
  const publicId = getStoredUserId()
  return publicId ? { 'X-User-Id': publicId } : {}
}
