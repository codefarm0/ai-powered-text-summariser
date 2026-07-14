import { useState } from 'react'
import MarkdownViewer from './MarkdownViewer'
import type { Summary } from '../types'

interface SummaryViewerProps {
  summary: Summary | null
  streamingText?: string
  isStreaming?: boolean
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function SummaryViewer({ summary, streamingText, isStreaming }: SummaryViewerProps) {
  const [copied, setCopied] = useState(false)

  const displayText = streamingText || summary?.summary || ''
  const hasContent = displayText.length > 0

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!hasContent && !isStreaming) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-12 text-center">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-sm text-gray-500">
          Your generated summary will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-sm font-medium text-gray-700">
          {isStreaming ? 'Generating...' : 'Summary'}
        </span>
        {!isStreaming && summary && (
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>
              {summary.inputTokens} in / {summary.outputTokens} out
            </span>
            <span>{formatMs(summary.responseTimeMs)}</span>
            <span className="capitalize">{summary.model}</span>
          </div>
        )}
      </div>
      <div className="px-5 py-4">
        <MarkdownViewer content={displayText} />
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-indigo-600 ml-0.5 animate-pulse" />
        )}
      </div>
      {!isStreaming && hasContent && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
