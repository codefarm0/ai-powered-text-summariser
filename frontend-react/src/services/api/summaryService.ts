import { apiDelete, apiGet, apiPost } from '../api'
import type {
  GenerateSummaryRequest,
  PaginatedResponse,
  Summary,
} from '../../types'

export async function generateSummary(
  _publicId: string,
  projectId: number,
  request: GenerateSummaryRequest
): Promise<Summary> {
  return apiPost<Summary>(
    `/api/v1/projects/${projectId}/summaries`,
    request
  )
}

export async function* streamSummary(
  publicId: string,
  projectId: number,
  request: GenerateSummaryRequest
): AsyncGenerator<string> {
  const response = await fetch(`/api/v1/projects/${projectId}/summaries/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': publicId,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Stream failed: ${response.status}`)
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

export async function getSummaries(
  _publicId: string,
  projectId: number,
  page = 0,
  size = 10,
  filters?: { summaryType?: string; model?: string }
): Promise<PaginatedResponse<Summary>> {
  let url = `/api/v1/projects/${projectId}/summaries?page=${page}&size=${size}`
  if (filters?.summaryType) url += `&summaryType=${filters.summaryType}`
  if (filters?.model) url += `&model=${filters.model}`
  return apiGet<PaginatedResponse<Summary>>(url)
}

export async function getSummary(
  _publicId: string,
  _projectId: number,
  summaryId: number
): Promise<Summary> {
  return apiGet<Summary>(
    `/api/v1/projects/${_projectId}/summaries/${summaryId}`
  )
}

export async function deleteSummary(
  _publicId: string,
  _projectId: number,
  summaryId: number
): Promise<void> {
  return apiDelete(
    `/api/v1/projects/${_projectId}/summaries/${summaryId}`
  )
}
