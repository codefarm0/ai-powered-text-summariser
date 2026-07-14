import { apiGet, apiPost } from '../api'
import type { User } from '../../types'

const USER_KEY = 'publicId'

function getStoredUserId(): string | null {
  return localStorage.getItem(USER_KEY)
}

function storeUserId(id: string): void {
  localStorage.setItem(USER_KEY, id)
}

export async function createGuestUser(): Promise<User> {
  const existingId = getStoredUserId()
  if (existingId) {
    try {
      return await apiGet<User>(`/api/v1/users/me`)
    } catch {
      localStorage.removeItem(USER_KEY)
    }
  }
  const user = await apiPost<User>('/api/v1/users/guest', {})
  storeUserId(user.publicId)
  return user
}

export async function getUserProfile(): Promise<User> {
  return apiGet<User>('/api/v1/users/me')
}

export async function updatePreferences(prefs: {
  preferredModel?: string
  preferredSummaryType?: string
}): Promise<User> {
  return apiPost<User>('/api/v1/users/preferences', prefs)
}
