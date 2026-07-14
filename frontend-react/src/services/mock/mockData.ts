import type { Project, Summary, SummaryType, User } from '../../types'

export const AVAILABLE_MODELS = ['mistral', 'llama3', 'qwen']

export function generateMockUser(): User {
  const id = crypto.randomUUID()
  return {
    publicId: id,
    displayName: `Guest-${Math.floor(1000 + Math.random() * 9000)}`,
    preferredModel: 'mistral',
    preferredSummaryType: 'EXECUTIVE',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  }
}

const sampleTexts = [
  `Artificial intelligence is transforming the software development landscape in unprecedented ways. From automated code generation to intelligent debugging assistants, AI-powered tools are becoming an integral part of modern development workflows. This transformation is not just about replacing human developers but augmenting their capabilities to achieve higher productivity and creativity.`,
  `Kubernetes has emerged as the de facto standard for container orchestration in production environments. It provides automated deployment, scaling, and management of containerized applications. Understanding its core concepts—pods, services, deployments, and namespaces—is essential for any DevOps engineer working with cloud-native architectures.`,
  `The Java programming language continues to evolve with new features being added in every release. Recent versions have introduced pattern matching, record classes, sealed classes, and enhanced switch expressions. These features enable developers to write more expressive and concise code while maintaining type safety and backward compatibility.`,
]

const sampleSummaries: Record<SummaryType, (text: string) => string> = {
  SHORT: (text) => text.split('.')[0] + '.',
  DETAILED: (text) => {
    const sentences = text.split('. ').filter(Boolean)
    return sentences.map((s, i) => `${i + 1}. ${s}.`).join('\n\n')
  },
  EXECUTIVE: (text) => {
    const firstSentence = text.split('.')[0]
    return `## Executive Summary\n\n${firstSentence}. This analysis covers the key implications and future outlook of this technology trend.\n\n### Key Takeaways\n\n- Significant industry impact expected\n- Requires strategic planning\n- Multiple stakeholders involved`
  },
  BULLET_POINTS: (text) => {
    const words = text.split(' ')
    const chunks = []
    for (let i = 0; i < words.length; i += 8) {
      chunks.push(words.slice(i, i + 8).join(' '))
    }
    return chunks.map((c) => `- ${c}`).join('\n')
  },
}

let summaryIdCounter = 1

export function generateMockSummary(
  projectId: number,
  text: string,
  summaryType: SummaryType,
  model: string
): Summary {
  const inputTokens = text.split(/\s+/).length * 1.3
  const summary = sampleSummaries[summaryType](text)
  const outputTokens = summary.split(/\s+/).length
  return {
    id: summaryIdCounter++,
    projectId,
    originalText: text,
    summary,
    summaryType,
    model,
    inputTokens: Math.round(inputTokens),
    outputTokens: Math.round(outputTokens),
    responseTimeMs: Math.round(800 + Math.random() * 2000),
    createdAt: new Date().toISOString(),
  }
}

export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Spring AI Learning',
    description: 'Exploring Spring AI and local LLM integration',
    defaultModel: 'mistral',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    name: 'System Design Interview Prep',
    description: 'Summarizing distributed systems concepts',
    defaultModel: 'llama3',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 3,
    name: 'Research Notes',
    description: 'AI and machine learning paper summaries',
    defaultModel: 'qwen',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const mockSummaries: Summary[] = mockProjects.flatMap((project, pIdx) =>
  [0, 1].map((i) => {
    const textIdx = (pIdx + i) % sampleTexts.length
    const types: SummaryType[] = ['SHORT', 'DETAILED', 'EXECUTIVE', 'BULLET_POINTS']
    const type = types[(pIdx + i) % types.length]
    const model = AVAILABLE_MODELS[(pIdx + i) % AVAILABLE_MODELS.length]
    const s = generateMockSummary(project.id, sampleTexts[textIdx], type, model)
    s.createdAt = new Date(Date.now() - 86400000 * (pIdx * 2 + i)).toISOString()
    return s
  })
)
