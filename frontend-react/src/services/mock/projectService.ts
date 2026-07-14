import type { PaginatedResponse, Project } from '../../types'
import { mockProjects } from './mockData'

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

let projects = [...mockProjects]
let nextId = projects.length + 1

export async function getProjects(
  _publicId: string,
  page = 0,
  size = 10
): Promise<PaginatedResponse<Project>> {
  await delay()
  const sorted = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
  const start = page * size
  const content = sorted.slice(start, start + size)
  return {
    content,
    page,
    size,
    totalElements: projects.length,
    totalPages: Math.ceil(projects.length / size),
  }
}

export async function getProject(
  _publicId: string,
  projectId: number
): Promise<Project> {
  await delay(200)
  const project = projects.find((p) => p.id === projectId)
  if (!project) throw new Error('Project not found')
  return project
}

export async function createProject(
  _publicId: string,
  name: string,
  description?: string
): Promise<Project> {
  await delay(500)
  const now = new Date().toISOString()
  const project: Project = {
    id: nextId++,
    name,
    description: description || '',
    defaultModel: 'mistral',
    createdAt: now,
    updatedAt: now,
  }
  projects.push(project)
  return project
}

export async function updateProject(
  _publicId: string,
  projectId: number,
  name: string,
  description?: string
): Promise<Project> {
  await delay(400)
  const idx = projects.findIndex((p) => p.id === projectId)
  if (idx === -1) throw new Error('Project not found')
  projects[idx] = {
    ...projects[idx],
    name,
    description: description ?? projects[idx].description,
    updatedAt: new Date().toISOString(),
  }
  return projects[idx]
}

export async function deleteProject(
  _publicId: string,
  projectId: number
): Promise<void> {
  await delay(300)
  const idx = projects.findIndex((p) => p.id === projectId)
  if (idx === -1) throw new Error('Project not found')
  projects.splice(idx, 1)
}
