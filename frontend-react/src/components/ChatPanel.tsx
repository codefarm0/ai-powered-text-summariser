import { useCallback, useEffect, useRef, useState } from 'react'
import type { Conversation, Message } from '../types'
import LoadingIndicator from './LoadingIndicator'
import MarkdownViewer from './MarkdownViewer'
import ModelSelector from './ModelSelector'

interface ChatPanelProps {
  publicId: string
  projectId: number
  listConversations: () => Promise<Conversation[]>
  createConversation: (title: string) => Promise<Conversation>
  deleteConversation: (id: number) => Promise<void>
  getMessages: (conversationId: number) => Promise<Message[]>
  sendMessage: (conversationId: number, text: string, model: string) => Promise<Message>
  streamChat: (conversationId: number, text: string, model: string) => AsyncGenerator<string>
  saveAiResponse: (conversationId: number, content: string) => Promise<void>
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPanel({
  listConversations, createConversation, deleteConversation,
  getMessages, sendMessage, streamChat, saveAiResponse,
}: ChatPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState('mistral')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [showNewConv, setShowNewConv] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async () => {
    setLoadingList(true)
    try {
      const list = await listConversations()
      setConversations(list)
    } finally {
      setLoadingList(false)
    }
  }, [listConversations])

  const loadMessages = useCallback(async (convId: number) => {
    setLoadingMessages(true)
    try {
      const msgs = await getMessages(convId)
      setMessages(msgs)
    } finally {
      setLoadingMessages(false)
    }
  }, [getMessages])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId)
      setStreamingContent('')
    }
  }, [activeConvId, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSelectConv = (id: number) => {
    setActiveConvId(id)
    setShowNewConv(false)
  }

  const handleCreateConv = async () => {
    if (!newTitle.trim()) return
    const conv = await createConversation(newTitle.trim())
    setConversations((prev) => [conv, ...prev])
    setActiveConvId(conv.id)
    setNewTitle('')
    setShowNewConv(false)
    setMessages([])
  }

  const handleDeleteConv = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    await deleteConversation(id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeConvId === id) {
      setActiveConvId(null)
      setMessages([])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !activeConvId || sending) return

    const userText = input.trim()
    setInput('')
    setSending(true)
    setStreamingContent('')

    const userMsg: Message = {
      id: Date.now(),
      conversationId: activeConvId,
      role: 'USER',
      content: userText,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      await sendMessage(activeConvId, userText, model)

      let accumulated = ''
      const stream = streamChat(activeConvId, userText, model)
      for await (const chunk of stream) {
        accumulated += chunk
        setStreamingContent(accumulated)
      }

      await saveAiResponse(activeConvId, accumulated)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          conversationId: activeConvId,
          role: 'AI',
          content: accumulated,
          createdAt: new Date().toISOString(),
        },
      ])
      setStreamingContent('')
    } catch {
      setStreamingContent('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Conversations list */}
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Conversations</h3>
          <button
            onClick={() => setShowNewConv(!showNewConv)}
            className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {showNewConv && (
          <div className="mb-3 flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Conversation title"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateConv()}
            />
            <button
              onClick={handleCreateConv}
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        )}

        {loadingList ? (
          <LoadingIndicator message="Loading..." />
        ) : conversations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConv(conv.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                  activeConvId === conv.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => handleDeleteConv(e, conv.id)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Chat area */}
      <div className="lg:col-span-2">
        {!activeConvId ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm text-gray-500">Select or create a conversation to start chatting</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden flex flex-col h-[550px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {loadingMessages ? (
                <LoadingIndicator message="Loading messages..." />
              ) : messages.length === 0 && !sending ? (
                <div className="text-center text-sm text-gray-400 py-8">
                  Start a conversation by sending a message
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                        msg.role === 'USER'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-50 text-gray-900 border border-gray-100'
                      }`}
                    >
                      {msg.role === 'USER' ? (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm max-w-none">
                          <MarkdownViewer content={msg.content} />
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${msg.role === 'USER' ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-xl px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-100">
                    <div className="text-sm prose prose-sm max-w-none">
                      <MarkdownViewer content={streamingContent} />
                      <span className="inline-block w-1.5 h-4 bg-indigo-600 ml-0.5 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 px-4 py-3 bg-white">
              <div className="flex gap-2 mb-2">
                <ModelSelector value={model} onChange={setModel} />
              </div>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {sending ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
