import type { User } from '../../types'
import { generateMockUser } from './mockData'

const USER_KEY = 'ai_summarizer_user'

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function loadUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function saveUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export async function createGuestUser(): Promise<User> {
  await delay()
  const existing = loadUser()
  if (existing) {
    existing.lastActiveAt = new Date().toISOString()
    saveUser(existing)
    return existing
  }
  const user = generateMockUser()
  saveUser(user)
  return user
}

export async function getUserProfile(): Promise<User> {
  await delay(200)
  const user = loadUser()
  if (!user) throw new Error('User not found')
  user.lastActiveAt = new Date().toISOString()
  saveUser(user)
  return user
}

export async function updatePreferences(prefs: {
  preferredModel?: string
  preferredSummaryType?: string
}): Promise<User> {
  await delay(400)
  const user = loadUser()
  if (!user) throw new Error('User not found')
  if (prefs.preferredModel) user.preferredModel = prefs.preferredModel
  if (prefs.preferredSummaryType) user.preferredSummaryType = prefs.preferredSummaryType as any
  saveUser(user)
  return user
}
