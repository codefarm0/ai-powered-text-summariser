import type { DocumentExtractResponse } from '../../types'

export async function extractDocumentText(
  publicId: string,
  projectId: number,
  file: File,
  onProgress?: (pct: number) => void
): Promise<DocumentExtractResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const body = JSON.parse(xhr.responseText)
        resolve(body.data as DocumentExtractResponse)
      } else {
        try {
          const body = JSON.parse(xhr.responseText)
          reject(new Error(body.message || `Upload failed: ${xhr.status}`))
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))

    xhr.open('POST', `http://localhost:8080/api/v1/projects/${projectId}/documents/extract`)
    xhr.setRequestHeader('X-User-Id', publicId)
    xhr.send(formData)
  })
}
