import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getProject, updateProject } from '../services/api/projectService'
import {
  generateSummary,
  getSummaries,
  deleteSummary,
  streamSummary,
} from '../services/api/summaryService'
import type { Project, Summary, SummaryType } from '../types'
import { SUMMARY_TYPE_LABELS } from '../types'
import SummaryEditor from '../components/SummaryEditor'
import SummaryViewer from '../components/SummaryViewer'
import SummaryTypeSelector from '../components/SummaryTypeSelector'
import ModelSelector from '../components/ModelSelector'
import LoadingIndicator from '../components/LoadingIndicator'
import ConfirmationDialog from '../components/ConfirmationDialog'
import DocumentUpload from '../components/DocumentUpload'
import ChatPanel from '../components/ChatPanel'
import { extractDocumentText } from '../services/api/documentService'
import {
  listConversations,
  createConversation,
  deleteConversation,
  getMessages,
  sendMessage,
  streamChatResponse,
} from '../services/api/conversationService'

type Tab = 'summary' | 'history' | 'chat'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useUser()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('summary')

  // Summary tab state
  const [text, setText] = useState('')
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [summaryType, setSummaryType] = useState<SummaryType>('EXECUTIVE')
  const [model, setModel] = useState('mistral')
  const [generating, setGenerating] = useState(false)
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null)
  const [streamingText, setStreamingText] = useState('')
  const abortRef = useRef(false)

  // History tab state
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Summary | null>(null)

  // Rename state
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')

  const loadProject = useCallback(async () => {
    if (!user || !projectId) return
    try {
      const p = await getProject(user.publicId, Number(projectId))
      setProject(p)
      setRenameValue(p.name)
      setModel(p.defaultModel)
    } catch {
      setError('Project not found')
    } finally {
      setLoading(false)
    }
  }, [user, projectId])

  const loadHistory = useCallback(async () => {
    if (!user || !projectId) return
    setHistoryLoading(true)
    try {
      const res = await getSummaries(user.publicId, Number(projectId), 0, 50, {
        summaryType: filterType || undefined,
        model: filterModel || undefined,
      })
      setSummaries(res.content)
    } finally {
      setHistoryLoading(false)
    }
  }, [user, projectId, filterType, filterModel])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory()
    }
  }, [activeTab, loadHistory])

  const handleGenerate = async () => {
    if (!user || !projectId || !text.trim() || generating) return
    abortRef.current = false
    setGenerating(true)
    setStreamingText('')
    setCurrentSummary(null)

    const request = { text: text.trim(), summaryType, model }

    try {
      // Start streaming
      const stream = streamSummary(user.publicId, Number(projectId), request)
      let accumulated = ''
      for await (const chunk of stream) {
        if (abortRef.current) break
        accumulated += chunk
        setStreamingText(accumulated)
      }
      if (!abortRef.current) {
        // Once streaming is done, get the full summary object
        const result = await generateSummary(user.publicId, Number(projectId), request)
        setCurrentSummary(result)
        setStreamingText('')
      }
    } catch {
      setStreamingText('')
    } finally {
      setGenerating(false)
    }
  }

  const handleTextExtracted = (extractedText: string, fileName: string) => {
    setText(extractedText)
    setUploadedFile(fileName)
  }

  const handleRegenerate = () => {
    setCurrentSummary(null)
    setStreamingText('')
    handleGenerate()
  }

  const handleDeleteSummary = async () => {
    if (!user || !deleteTarget || !projectId) return
    await deleteSummary(user.publicId, Number(projectId), deleteTarget.id)
    if (selectedSummary?.id === deleteTarget.id) setSelectedSummary(null)
    setDeleteTarget(null)
    await loadHistory()
  }

  if (loading) return <LoadingIndicator message="Loading project..." />
  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 mb-4">{error || 'Project not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'summary', label: 'Summary' },
    { key: 'history', label: 'History' },
    { key: 'chat', label: 'Chat' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Project Name */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
        <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">
          Dashboard
        </button>
        <span>/</span>
      </div>
      <div className="flex items-center justify-between mb-6">
        {renaming ? (
          <div className="flex items-center gap-2">
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="px-3 py-1.5 text-lg font-bold text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && user) {
                  const updated = await updateProject(user.publicId, project.id, renameValue, project.description)
                  setProject(updated)
                  setRenaming(false)
                }
                if (e.key === 'Escape') {
                  setRenameValue(project.name)
                  setRenaming(false)
                }
              }}
            />
            <button
              onClick={async () => {
                if (!user) return
                const updated = await updateProject(user.publicId, project.id, renameValue, project.description)
                setProject(updated)
                setRenaming(false)
              }}
              className="p-1.5 text-indigo-600 hover:text-indigo-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <button
              onClick={() => setRenaming(true)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Rename project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Input */}
          <div className="space-y-5">
            <DocumentUpload
              onTextExtracted={handleTextExtracted}
              disabled={generating}
              uploadFn={(file, onProgress) =>
                extractDocumentText(user!.publicId, Number(projectId), file, onProgress)
              }
            />
            {uploadedFile && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Loaded: {uploadedFile}
                <button
                  onClick={() => { setText(''); setUploadedFile(null) }}
                  className="ml-auto text-green-600 hover:text-green-800"
                >
                  Clear
                </button>
              </div>
            )}
            <SummaryEditor text={text} onChange={setText} disabled={generating} />
            <SummaryTypeSelector value={summaryType} onChange={setSummaryType} />
            <ModelSelector value={model} onChange={setModel} />
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={!text.trim() || generating}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {generating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Summary
                  </>
                )}
              </button>
              {currentSummary && (
                <button
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Regenerate
                </button>
              )}
            </div>
          </div>

          {/* Right: Output */}
          <div>
            <SummaryViewer
              summary={currentSummary}
              streamingText={streamingText}
              isStreaming={generating}
            />
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Filters + List */}
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                {(Object.keys(SUMMARY_TYPE_LABELS) as SummaryType[]).map((t) => (
                  <option key={t} value={t}>{SUMMARY_TYPE_LABELS[t]}</option>
                ))}
              </select>
              <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Models</option>
                {['mistral', 'llama3.1', 'qwen'].map((m) => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Summary List */}
            {historyLoading ? (
              <LoadingIndicator message="Loading history..." />
            ) : summaries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">📄</div>
                <p className="text-sm text-gray-500">No summaries yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {summaries.map((s) => (
                  <div
                    key={s.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedSummary?.id === s.id
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedSummary(s)}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {SUMMARY_TYPE_LABELS[s.summaryType]}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">{s.model}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(s)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete summary"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{s.summary.slice(0, 120)}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{formatDate(s.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Detail */}
          <div className="space-y-4">
            {selectedSummary ? (
              <>
                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">Original Text</span>
                  </div>
                  <div className="px-5 py-4 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedSummary.originalText}
                  </div>
                </div>
                <SummaryViewer summary={selectedSummary} />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">👆</div>
                <p className="text-sm text-gray-500">
                  Select a summary to view its details
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && user && (
        <ChatPanel
          publicId={user.publicId}
          projectId={Number(projectId)}
          listConversations={() => listConversations(user.publicId, Number(projectId))}
          createConversation={(title) => createConversation(user.publicId, Number(projectId), title)}
          deleteConversation={(id) => deleteConversation(user.publicId, Number(projectId), id)}
          getMessages={(convId) => getMessages(user.publicId, Number(projectId), convId)}
          sendMessage={(convId, text, model) => sendMessage(user.publicId, Number(projectId), convId, text, model)}
          streamChat={(convId, text, model) => streamChatResponse(user.publicId, Number(projectId), convId, text, model)}
          saveAiResponse={async (convId, content) => {
            await fetch(`/api/v1/projects/${projectId}/conversations/${convId}/messages/save`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content }),
            })
          }}
        />
      )}

      <ConfirmationDialog
        open={deleteTarget !== null}
        title="Delete Summary"
        message="Are you sure you want to delete this summary?"
        onConfirm={handleDeleteSummary}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
