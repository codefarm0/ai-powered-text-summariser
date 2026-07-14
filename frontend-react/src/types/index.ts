export interface User {
  publicId: string
  displayName: string
  preferredModel: string
  preferredSummaryType: SummaryType
  createdAt: string
  lastActiveAt: string
}

export interface Project {
  id: number
  name: string
  description: string
  defaultModel: string
  createdAt: string
  updatedAt: string
}

export type SummaryType = 'SHORT' | 'DETAILED' | 'EXECUTIVE' | 'BULLET_POINTS'

export const SUMMARY_TYPE_LABELS: Record<SummaryType, string> = {
  SHORT: 'Short',
  DETAILED: 'Detailed',
  EXECUTIVE: 'Executive',
  BULLET_POINTS: 'Bullet Points',
}

export interface Summary {
  id: number
  projectId: number
  originalText: string
  summary: string
  summaryType: SummaryType
  model: string
  inputTokens: number
  outputTokens: number
  responseTimeMs: number
  createdAt: string
}

export interface Conversation {
  id: number
  projectId: number
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

export interface Message {
  id: number
  conversationId: number
  role: string
  content: string
  createdAt: string
}

export interface DocumentExtractResponse {
  id: number
  projectId: number
  fileName: string
  fileSize: number
  mimeType: string
  extractedText: string
  createdAt: string
}

export interface GenerateSummaryRequest {
  text: string
  summaryType: SummaryType
  model: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
}

export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
