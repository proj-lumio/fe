import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  Send,
  Plus,
  Search,
  MessageSquare,
  FileText,
  Bot,
  User,
  ChevronRight,
  Sparkles,
  Loader2,
  Network,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { chatApi, companiesApi } from "@/lib/api"
import type { ChatMessage, ChatSources } from "@/types"

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")
  const [sidebarSearch, setSidebarSearch] = useState("")
  const [showSources, setShowSources] = useState<string | null>(null)
  const [newSessionOpen, setNewSessionOpen] = useState(false)
  const [newSessionCompanyId, setNewSessionCompanyId] = useState("")
  const [newSessionTitle, setNewSessionTitle] = useState("")

  // Fetch sessions list
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["chatSessions"],
    queryFn: () => chatApi.listSessions(),
  })

  // Fetch current session
  const { data: currentSession } = useQuery({
    queryKey: ["chatSession", conversationId],
    queryFn: () => chatApi.getSession(conversationId!),
    enabled: !!conversationId,
  })

  // Messages are embedded in the session
  const messages: ChatMessage[] = currentSession?.messages ?? []

  // Fetch companies for new session dialog
  const { data: companiesData } = useQuery({
    queryKey: ["companies", { page: 1, page_size: 100 }],
    queryFn: () => companiesApi.list({ page: 1, page_size: 100 }),
    enabled: newSessionOpen,
  })

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(conversationId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSession", conversationId] })
      setInputValue("")
    },
  })

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: () =>
      chatApi.createSession(newSessionCompanyId, newSessionTitle || "New Chat"),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] })
      setNewSessionOpen(false)
      setNewSessionCompanyId("")
      setNewSessionTitle("")
      navigate(`/chat/${session.id}`)
    },
  })

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const sessions = sessionsData?.items ?? (Array.isArray(sessionsData) ? sessionsData : [])
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(sidebarSearch.toLowerCase())
  )

  function handleSend() {
    const content = inputValue.trim()
    if (!content || !conversationId) return
    sendMutation.mutate(content)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <div className="hidden w-72 shrink-0 flex-col rounded-xl border border-border bg-card md:flex">
        {/* Sidebar Header */}
        <div className="border-b border-border p-3">
          <Button className="w-full" size="sm" onClick={() => setNewSessionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </div>

        {/* Search */}
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 pl-8 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2">
          {sessionsLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => navigate(`/chat/${session.id}`)}
                className={cn(
                  "flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                  conversationId === session.id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm font-medium">{session.title}</span>
                </div>
                <div className="flex items-center gap-2 pl-5.5 text-xs text-muted-foreground">
                  <span>{new Date(session.updated_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card">
        {!conversationId ? (
          /* No conversation selected */
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Select a conversation</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Choose an existing conversation from the sidebar or create a new one to get started.
            </p>
            <Button className="mt-6" onClick={() => setNewSessionOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">
                  {currentSession?.title ?? "Loading..."}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {messages.length} messages
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bot className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Send a message to start the conversation. Lumio will search your
                      documents and knowledge graph to provide grounded answers.
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {msg.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {msg.role === "user" ? "You" : "Lumio"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          {msg.content}
                        </div>
                      </div>
                    </div>

                    {/* Sources */}
                    {msg.sources && (
                      <SourcesPanel
                        sources={msg.sources}
                        msgId={msg.id}
                        showSources={showSources}
                        setShowSources={setShowSources}
                      />
                    )}
                  </div>
                ))}

                {sendMutation.isPending && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-2">
                  <textarea
                    rows={1}
                    placeholder="Ask about your documents..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="shrink-0"
                    disabled={!inputValue.trim() || sendMutation.isPending}
                    onClick={handleSend}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Lumio grounds answers in your indexed documents. Always verify critical decisions.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* New Session Dialog */}
      <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>
              Select a company to start a new chat session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Company *</Label>
              <select
                value={newSessionCompanyId}
                onChange={(e) => setNewSessionCompanyId(e.target.value)}
                className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a company...</option>
                {(companiesData?.items ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="Chat title (optional)"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSessionOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createSessionMutation.mutate()}
              disabled={!newSessionCompanyId || createSessionMutation.isPending}
            >
              {createSessionMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Start Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SourcesPanel({
  sources,
  msgId,
  showSources,
  setShowSources,
}: {
  sources: ChatSources
  msgId: string
  showSources: string | null
  setShowSources: (id: string | null) => void
}) {
  const hasVectorResults = sources.vector_results && sources.vector_results.length > 0
  const hasGraphEntities = sources.graph_entities && sources.graph_entities.length > 0

  if (!hasVectorResults && !hasGraphEntities) return null

  const totalSources =
    (sources.vector_results?.length ?? 0) + (sources.graph_entities?.length ?? 0)

  return (
    <div className="ml-11">
      <button
        onClick={() => setShowSources(showSources === msgId ? null : msgId)}
        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Sparkles className="h-3 w-3" />
        {totalSources} sources
        <ChevronRight
          className={cn(
            "h-3 w-3 transition-transform",
            showSources === msgId && "rotate-90"
          )}
        />
      </button>
      {showSources === msgId && (
        <div className="mt-2 space-y-2">
          {sources.vector_results?.map((result, i) => (
            <Card key={i} className="rounded-xl p-3">
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      Document: {result.document_id.slice(0, 8)}...
                    </span>
                    <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {(result.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {sources.graph_entities?.map((entity, i) => (
            <Card key={`ge-${i}`} className="rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Network className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium">Graph Entity: {entity}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
