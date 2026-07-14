import type {
  GenerateSummaryRequest,
  PaginatedResponse,
  Summary,
  SummaryType,
} from '../../types'
import { generateMockSummary, mockSummaries } from './mockData'

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

let summaries = [...mockSummaries]

export async function generateSummary(
  _publicId: string,
  projectId: number,
  request: GenerateSummaryRequest
): Promise<Summary> {
  await delay(800 + Math.random() * 1200)
  const summary = generateMockSummary(
    projectId,
    request.text,
    request.summaryType,
    request.model
  )
  summaries.push(summary)
  return summary
}

export async function* streamSummary(
  _publicId: string,
  projectId: number,
  request: GenerateSummaryRequest
): AsyncGenerator<string> {
  const summary = generateMockSummary(
    projectId,
    request.text,
    request.summaryType,
    request.model
  )
  summaries.push(summary)

  const words = summary.summary.split(/(\s+)/)
  for (const word of words) {
    yield word
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 40))
  }
}

const summaryTypeFilterLabels: Record<string, SummaryType | undefined> = {
  SHORT: 'SHORT',
  DETAILED: 'DETAILED',
  EXECUTIVE: 'EXECUTIVE',
  BULLET_POINTS: 'BULLET_POINTS',
}

export async function getSummaries(
  _publicId: string,
  projectId: number,
  page = 0,
  size = 10,
  filters?: { summaryType?: string; model?: string }
): Promise<PaginatedResponse<Summary>> {
  await delay()
  let filtered = summaries.filter((s) => s.projectId === projectId)

  if (filters?.summaryType && filters.summaryType in summaryTypeFilterLabels) {
    filtered = filtered.filter((s) => s.summaryType === filters.summaryType)
  }
  if (filters?.model) {
    filtered = filtered.filter((s) => s.model === filters.model)
  }

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const start = page * size
  const content = sorted.slice(start, start + size)
  return {
    content,
    page,
    size,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
  }
}

export async function getSummary(
  _publicId: string,
  _projectId: number,
  summaryId: number
): Promise<Summary> {
  await delay(200)
  const summary = summaries.find((s) => s.id === summaryId)
  if (!summary) throw new Error('Summary not found')
  return summary
}

export async function deleteSummary(
  _publicId: string,
  _projectId: number,
  summaryId: number
): Promise<void> {
  await delay(300)
  const idx = summaries.findIndex((s) => s.id === summaryId)
  if (idx === -1) throw new Error('Summary not found')
  summaries.splice(idx, 1)
}
