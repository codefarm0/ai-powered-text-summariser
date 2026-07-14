import { apiDelete, apiGet, apiPost } from '../api'
import type { PaginatedResponse, Project } from '../../types'

export async function getProjects(
  _publicId: string,
  page = 0,
  size = 10
): Promise<PaginatedResponse<Project>> {
  return apiGet<PaginatedResponse<Project>>(
    `/api/v1/projects?page=${page}&size=${size}`
  )
}

export async function getProject(
  _publicId: string,
  projectId: number
): Promise<Project> {
  return apiGet<Project>(`/api/v1/projects/${projectId}`)
}

export async function createProject(
  _publicId: string,
  name: string,
  description?: string
): Promise<Project> {
  return apiPost<Project>('/api/v1/projects', { name, description })
}

export async function updateProject(
  _publicId: string,
  projectId: number,
  name: string,
  description?: string
): Promise<Project> {
  return apiPost<Project>(`/api/v1/projects/${projectId}`, {
    name,
    description,
  })
}

export async function deleteProject(
  _publicId: string,
  projectId: number
): Promise<void> {
  return apiDelete(`/api/v1/projects/${projectId}`)
}
