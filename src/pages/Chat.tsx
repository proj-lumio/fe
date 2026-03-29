import { useState, useRef, useEffect, useCallback, memo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Send, Square, Trash2, MessageSquare, Loader2, ChevronLeft, FileText, Share2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { chatApi, companiesApi } from "@/lib/api"
import { useTranslations } from "@/hooks/useTranslations"
import { LiquidInput } from "@ui"
import type { ChatMessage, ChatSources } from "@/types"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.06] ${className}`} />
}

function MessageSkeleton({ align }: { align: "left" | "right" }) {
  return (
    <div className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}>
      <div className="liquid-card p-4 space-y-2" style={{ width: align === "right" ? "45%" : "60%" }}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        {align === "left" && <Skeleton className="h-4 w-1/2" />}
      </div>
    </div>
  )
}

const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-content text-sm text-white">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
})

function SourcesBadge({ sources }: { sources: ChatSources }) {
  const t = useTranslations()
  const vectorCount = sources.vector_results?.length ?? 0
  const graphCount = sources.graph_entities?.length ?? 0
  if (vectorCount === 0 && graphCount === 0) return null

  return (
    <div className="mt-3 pt-2 border-t border-white/[0.06] flex flex-wrap gap-2">
      {vectorCount > 0 && (
        <span className="inline-flex items-center gap-1.5 text-xs text-[#a9a9a9] bg-white/[0.04] px-2.5 py-1 rounded-lg">
          <FileText className="w-3 h-3 text-[#7966ff]" />
          {vectorCount} {t.chat.vector_results}
        </span>
      )}
      {graphCount > 0 && (
        <span className="inline-flex items-center gap-1.5 text-xs text-[#a9a9a9] bg-white/[0.04] px-2.5 py-1 rounded-lg">
          <Share2 className="w-3 h-3 text-[#22cfff]" />
          {graphCount} {t.chat.graph_entities}
        </span>
      )}
    </div>
  )
}

export default function Chat() {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [streamingContent, setStreamingContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newCompanyId, setNewCompanyId] = useState("")
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([])
  const [streamingSources, setStreamingSources] = useState<ChatSources | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sessionsQuery = useQuery({
    queryKey: ["chatSessions"],
    queryFn: () => chatApi.listSessions(),
  })

  const sessionDetailQuery = useQuery({
    queryKey: ["chatSession", selectedSessionId],
    queryFn: () => chatApi.getSession(selectedSessionId!),
    enabled: !!selectedSessionId,
  })

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesApi.list(),
    enabled: showNewForm,
  })

  const createSessionMutation = useMutation({
    mutationFn: (data: { company_id: string; title?: string }) =>
      chatApi.createSession(data),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] })
      setSelectedSessionId(session.id)
      setShowNewForm(false)
      setNewTitle("")
      setNewCompanyId("")
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: (id: string) => chatApi.deleteSession(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] })
      if (selectedSessionId === id) {
        setSelectedSessionId(null)
      }
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [sessionDetailQuery.data?.messages, optimisticMessages, streamingContent])

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [selectedSessionId])

  function stopStreaming() {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsStreaming(false)
    if (streamingContent) {
      const partialMsg: ChatMessage = {
        id: `partial-${Date.now()}`,
        session_id: selectedSessionId ?? "",
        user_id: "",
        role: "assistant",
        content: streamingContent,
        created_at: new Date().toISOString(),
      }
      setOptimisticMessages((prev) => [...prev, partialMsg])
    }
    setStreamingContent("")
    setStreamingSources(null)
    queryClient.invalidateQueries({ queryKey: ["chatSession", selectedSessionId] })
  }

  const handleSseFallback = useCallback(async (sessionId: string, content: string) => {
    const token = localStorage.getItem("lumio-token") ?? ""
    let accumulated = ""
    try {
      const res = await fetch(`/api/v1/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      })
      if (!res.ok || !res.body) throw new Error("SSE request failed")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === "chunk") {
              accumulated += data.data
              setStreamingContent(accumulated)
            } else if (data.type === "sources") {
              setStreamingSources(data.data)
            } else if (data.type === "done") {
              // done
            } else if (data.type === "error") {
              break
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } finally {
      setIsStreaming(false)
      setStreamingContent("")
      setOptimisticMessages([])
      setStreamingSources(null)
      queryClient.invalidateQueries({ queryKey: ["chatSession", sessionId] })
    }
  }, [queryClient])

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedSessionId || isStreaming) return

    const content = newMessage.trim()
    setNewMessage("")

    const optimisticUserMsg: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      session_id: selectedSessionId,
      user_id: "",
      role: "user",
      content,
      created_at: new Date().toISOString(),
    }
    setOptimisticMessages((prev) => [...prev, optimisticUserMsg])
    setIsStreaming(true)
    setStreamingContent("")
    setStreamingSources(null)

    try {
      const wsUrl = chatApi.getWsUrl(selectedSessionId)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      let accumulated = ""

      ws.onopen = () => {
        ws.send(JSON.stringify({ content }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "chunk") {
            accumulated += data.data
            setStreamingContent(accumulated)
          } else if (data.type === "sources") {
            setStreamingSources(data.data)
          } else if (data.type === "done") {
            setIsStreaming(false)
            setStreamingContent("")
            setOptimisticMessages([])
            setStreamingSources(null)
            queryClient.invalidateQueries({ queryKey: ["chatSession", selectedSessionId] })
            queryClient.invalidateQueries({ queryKey: ["chatSessions"] })
            ws.close()
            wsRef.current = null
          } else if (data.type === "error") {
            setIsStreaming(false)
            setStreamingContent("")
            ws.close()
            wsRef.current = null
          }
        } catch {
          // ignore parse errors
        }
      }

      ws.onerror = async () => {
        ws.close()
        wsRef.current = null
        try {
          await handleSseFallback(selectedSessionId, content)
        } catch {
          // ignore
        }
      }

      ws.onclose = () => {
        wsRef.current = null
      }
    } catch {
      try {
        await handleSseFallback(selectedSessionId, content)
      } catch {
        // ignore
      }
    }
  }, [newMessage, selectedSessionId, isStreaming, queryClient, handleSseFallback])

  const handleCreateSession = () => {
    if (!newCompanyId) return
    createSessionMutation.mutate({
      company_id: newCompanyId,
      title: newTitle || undefined,
    })
  }

  const allMessages: ChatMessage[] = [
    ...(sessionDetailQuery.data?.messages ?? []),
    ...optimisticMessages,
  ]

  const mobileShowChat = selectedSessionId !== null

  return (
    <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-120px)]" style={{ animation: "fadeInUp 500ms both" }}>
      {/* Left Panel - Session List */}
      <div
        className={`${mobileShowChat ? "hidden" : "flex"} sm:flex flex-col shrink-0 w-full sm:w-[280px]`}
        style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="p-4">
          <button
            onClick={() => setShowNewForm((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-center gap-2 text-white text-sm font-medium active:scale-[0.98] transition-transform duration-200"
            style={{ borderRadius: 12, background: "#1f1f1f" }}
          >
            <Plus className="w-4 h-4" />
            {t.chat.new_session}
          </button>
        </div>

        {showNewForm && (
          <div className="px-4 pb-4 space-y-3" style={{ animation: "fadeInUp 300ms both" }}>
            <div className="liquid-card p-3 space-y-3">
              <label className="text-xs text-[#a9a9a9] block">{t.chat.select_company}</label>
              <select
                value={newCompanyId}
                onChange={(e) => setNewCompanyId(e.target.value)}
                className="w-full bg-transparent text-white text-sm px-3 py-2 focus:outline-none liquid-input"
                style={{ borderRadius: 14, height: 40 }}
              >
                <option value="" disabled className="bg-[#1f1f1f]">{t.chat.select_company}</option>
                {companiesQuery.data?.items.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1f1f1f]">{c.name}</option>
                ))}
              </select>

              <label className="text-xs text-[#a9a9a9] block">{t.chat.session_title}</label>
              <LiquidInput
                placeholder={t.chat.session_title}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <div className="flex gap-2">
                <button
                  onClick={handleCreateSession}
                  disabled={!newCompanyId || createSessionMutation.isPending}
                  className="liquid-card-btn flex-1 px-3 py-2 text-white text-sm font-medium active:scale-[0.98] transition-transform duration-200 disabled:opacity-40"
                  style={{ borderRadius: 12 }}
                >
                  {createSessionMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    t.chat.create
                  )}
                </button>
                <button
                  onClick={() => { setShowNewForm(false); setNewTitle(""); setNewCompanyId("") }}
                  className="liquid-card-btn px-3 py-2 text-[#a9a9a9] text-sm active:scale-[0.98] transition-transform duration-200"
                  style={{ borderRadius: 12 }}
                >
                  {t.common.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {sessionsQuery.isLoading ? (
            <div className="space-y-2 py-2">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : sessionsQuery.data?.items.length === 0 ? (
            <div className="liquid-card p-4 mt-2">
              <p className="text-sm text-[#a9a9a9] text-center">{t.chat.no_sessions}</p>
            </div>
          ) : (
            sessionsQuery.data?.items.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className="liquid-card p-3 cursor-pointer transition-all duration-200 group flex items-center justify-between"
                style={{
                  backgroundColor:
                    selectedSessionId === session.id
                      ? "rgba(121, 102, 255, 0.15)"
                      : undefined,
                }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare className="w-4 h-4 text-[#7966ff] shrink-0" />
                  <span className="text-sm text-white truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSessionMutation.mutate(session.id) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-[#a9a9a9] hover:text-[#ff4b44]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Messages */}
      <div className={`${mobileShowChat ? "flex" : "hidden"} sm:flex flex-1 flex-col min-w-0`}>
        {!selectedSessionId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <MessageSquare className="w-12 h-12 text-[#a9a9a9]/30" />
            <p className="text-[#a9a9a9] text-sm">{t.chat.no_messages}</p>
          </div>
        ) : (
          <>
            {/* Mobile back button */}
            <div className="sm:hidden p-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => setSelectedSessionId(null)}
                className="flex items-center gap-1.5 text-sm text-[#a9a9a9] active:scale-[0.98] transition-transform duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                {t.chat.title}
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {sessionDetailQuery.isLoading ? (
                <div className="space-y-4 py-4">
                  <MessageSkeleton align="right" />
                  <MessageSkeleton align="left" />
                  <MessageSkeleton align="right" />
                  <MessageSkeleton align="left" />
                </div>
              ) : allMessages.length === 0 && !isStreaming ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <MessageSquare className="w-10 h-10 text-[#a9a9a9]/20" />
                  <p className="text-[#a9a9a9] text-sm">{t.chat.no_messages}</p>
                </div>
              ) : (
                <>
                  {allMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`liquid-card p-4 max-w-[85%] sm:max-w-[70%] ${
                          msg.role === "user" ? "bg-[#7966ff]/10" : ""
                        }`}
                      >
                        {msg.role === "user" ? (
                          <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <MarkdownContent content={msg.content} />
                        )}
                        {msg.role === "assistant" && msg.sources && (
                          <SourcesBadge sources={msg.sources} />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Streaming */}
                  {isStreaming && (
                    <div className="flex justify-start">
                      <div className="liquid-card p-4 max-w-[85%] sm:max-w-[70%]">
                        {streamingContent ? (
                          <>
                            <MarkdownContent content={streamingContent} />
                            <span className="inline-block w-2 h-4 bg-[#7966ff] ml-0.5 animate-pulse rounded-sm align-middle" />
                          </>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#7966ff]" style={{ animation: "thinkingDot 1.4s ease-in-out infinite", animationDelay: "0ms" }} />
                              <span className="w-2 h-2 rounded-full bg-[#7966ff]" style={{ animation: "thinkingDot 1.4s ease-in-out infinite", animationDelay: "200ms" }} />
                              <span className="w-2 h-2 rounded-full bg-[#7966ff]" style={{ animation: "thinkingDot 1.4s ease-in-out infinite", animationDelay: "400ms" }} />
                            </div>
                            <span className="text-xs text-[#a9a9a9] animate-pulse">{t.chat.thinking}</span>
                          </div>
                        )}
                        {streamingSources && (
                          <SourcesBadge sources={streamingSources} />
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 flex gap-3 items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex-1">
                <LiquidInput
                  placeholder={t.chat.placeholder}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (isStreaming) return
                      handleSendMessage()
                    }
                  }}
                  disabled={isStreaming}
                />
              </div>
              {isStreaming ? (
                <button
                  onClick={stopStreaming}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-200 active:scale-[0.95]"
                  style={{ background: "rgba(255, 75, 68, 0.15)" }}
                >
                  <Square className="w-4 h-4 text-[#ff4b44] fill-[#ff4b44]" />
                </button>
              ) : (
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="liquid-card-btn flex h-11 w-11 shrink-0 items-center justify-center text-white active:scale-[0.98] transition-transform duration-200 disabled:opacity-40"
                  style={{ borderRadius: 12 }}
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes thinkingDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }

        /* ── Markdown styles ── */
        .markdown-content p { margin-bottom: 0.5em; line-height: 1.7; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content strong { color: #fff; font-weight: 600; }
        .markdown-content em { color: #d1d1d1; }

        .markdown-content h1, .markdown-content h2, .markdown-content h3,
        .markdown-content h4, .markdown-content h5, .markdown-content h6 {
          color: #fff; font-weight: 600; margin-top: 1em; margin-bottom: 0.4em;
        }
        .markdown-content h1 { font-size: 1.25em; }
        .markdown-content h2 { font-size: 1.15em; }
        .markdown-content h3 { font-size: 1.05em; }

        .markdown-content ul, .markdown-content ol {
          padding-left: 1.5em; margin-bottom: 0.75em;
        }
        .markdown-content ul { list-style-type: disc; }
        .markdown-content ol { list-style-type: decimal; }
        .markdown-content li { margin-bottom: 0.25em; line-height: 1.6; }
        .markdown-content li::marker { color: #7966ff; }

        .markdown-content code {
          background: rgba(255,255,255,0.06);
          padding: 0.15em 0.4em;
          border-radius: 6px;
          font-size: 0.9em;
          font-family: 'SF Mono', 'Fira Code', monospace;
        }
        .markdown-content pre {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 1em;
          overflow-x: auto;
          margin: 0.75em 0;
        }
        .markdown-content pre code {
          background: none; padding: 0; border-radius: 0; font-size: 0.85em;
        }

        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75em 0;
          font-size: 0.85em;
        }
        .markdown-content thead th {
          text-align: left;
          padding: 0.5em 0.75em;
          border-bottom: 1px solid rgba(121, 102, 255, 0.3);
          color: #7966ff;
          font-weight: 600;
          white-space: nowrap;
        }
        .markdown-content tbody td {
          padding: 0.4em 0.75em;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          color: #d1d1d1;
        }
        .markdown-content tbody tr:hover td { background: rgba(255,255,255,0.02); }

        .markdown-content blockquote {
          border-left: 3px solid #7966ff;
          padding-left: 1em;
          margin: 0.75em 0;
          color: #a9a9a9;
        }

        .markdown-content hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin: 1em 0;
        }

        .markdown-content a {
          color: #22cfff;
          text-decoration: underline;
          text-decoration-color: rgba(34, 207, 255, 0.3);
          text-underline-offset: 2px;
        }
        .markdown-content a:hover { text-decoration-color: #22cfff; }
      `}</style>
    </div>
  )
}
