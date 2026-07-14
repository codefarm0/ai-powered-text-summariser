import { useRef, useState } from 'react'
import type { DocumentExtractResponse } from '../types'

interface DocumentUploadProps {
  onTextExtracted: (text: string, fileName: string) => void
  disabled?: boolean
  uploadFn: (file: File, onProgress: (pct: number) => void) => Promise<DocumentExtractResponse>
}

const ACCEPTED_TYPES = '.pdf,.docx,.doc,.txt,.rtf,.html,.odt'

export default function DocumentUpload({ onTextExtracted, disabled, uploadFn }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setProgress(0)
    setUploading(true)

    try {
      const result = await uploadFn(file, setProgress)
      onTextExtracted(result.extractedText, result.fileName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const onDragLeave = () => setDragOver(false)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-indigo-400 bg-indigo-50'
            : uploading
              ? 'border-gray-300 bg-gray-50 cursor-wait'
              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={onInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Extracting text... {progress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Upload a document
            </p>
            <p className="text-xs text-gray-400">
              Drop a file here or click to browse &mdash; PDF, DOCX, TXT, HTML, RTF, ODT
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
