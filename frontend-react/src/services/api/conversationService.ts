import type { Conversation, Message } from '../../types'
import { apiDelete, apiGet, apiPost } from '../api'

export async function createConversation(
  _publicId: string,
  projectId: number,
  title: string
): Promise<Conversation> {
  return apiPost<Conversation>(
    `/api/v1/projects/${projectId}/conversations`,
    { title }
  )
}

export async function listConversations(
  _publicId: string,
  projectId: number
): Promise<Conversation[]> {
  return apiGet<Conversation[]>(
    `/api/v1/projects/${projectId}/conversations`
  )
}

export async function getConversation(
  _publicId: string,
  projectId: number,
  conversationId: number
): Promise<Conversation> {
  return apiGet<Conversation>(
    `/api/v1/projects/${projectId}/conversations/${conversationId}`
  )
}

export async function deleteConversation(
  _publicId: string,
  projectId: number,
  conversationId: number
): Promise<void> {
  return apiDelete(
    `/api/v1/projects/${projectId}/conversations/${conversationId}`
  )
}

export async function getMessages(
  _publicId: string,
  projectId: number,
  conversationId: number
): Promise<Message[]> {
  return apiGet<Message[]>(
    `/api/v1/projects/${projectId}/conversations/${conversationId}/messages`
  )
}

export async function sendMessage(
  _publicId: string,
  projectId: number,
  conversationId: number,
  message: string,
  model: string
): Promise<Message> {
  return apiPost<Message>(
    `/api/v1/projects/${projectId}/conversations/${conversationId}/messages`,
    { message, model }
  )
}

export async function* streamChatResponse(
  publicId: string,
  projectId: number,
  conversationId: number,
  message: string,
  model: string
): AsyncGenerator<string> {
  const response = await fetch(
    `/api/v1/projects/${projectId}/conversations/${conversationId}/messages/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': publicId,
      },
      body: JSON.stringify({ message, model }),
    }
  )

  if (!response.ok) {
    throw new Error(`Chat stream failed: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const chunk = line.slice(5)
        if (chunk) yield chunk
      }
    }
  }
}
