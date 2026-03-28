import { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  ArrowLeft,
  Building2,
  FileText,
  MessageSquare,
  Upload,
  ExternalLink,
  Globe,
  TrendingUp,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  File,
  Trash2,
  Pencil,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { companiesApi, documentsApi, chatApi } from "@/lib/api"
import type { CompanyUpdate } from "@/types"

const tabs = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "chat", label: "Chat", icon: MessageSquare },
] as const

type TabId = (typeof tabs)[number]["id"]

const statusConfig = {
  completed: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  processing: { icon: Loader2, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  failed: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [isDragOver, setIsDragOver] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<CompanyUpdate>({})

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["company", id],
    queryFn: () => companiesApi.get(id!),
    enabled: !!id,
  })

  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ["documents", id],
    queryFn: () => documentsApi.list(id!),
    enabled: !!id && activeTab === "documents",
    refetchInterval: 10000,
  })

  const { data: sessions } = useQuery({
    queryKey: ["chatSessions", id],
    queryFn: () => chatApi.listSessions(id),
    enabled: !!id && activeTab === "chat",
  })

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => {
      if (files.length === 1) {
        return documentsApi.upload(id!, files[0])
      }
      return documentsApi.uploadMultiple(id!, files)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", id] })
    },
  })

  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) => documentsApi.delete(id!, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", id] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: CompanyUpdate) => companiesApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", id] })
      setEditOpen(false)
    },
  })

  const createSessionMutation = useMutation({
    mutationFn: () => chatApi.createSession(id!, `Chat about ${company?.name ?? "company"}`),
    onSuccess: (session) => {
      navigate(`/chat/${session.id}`)
    },
  })

  function handleFiles(files: FileList | File[]) {
    const fileArr = Array.from(files)
    if (fileArr.length > 0) {
      uploadMutation.mutate(fileArr)
    }
  }

  const documents = docsData?.items ?? (Array.isArray(docsData) ? docsData : [])

  if (companyLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Company not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/companies")}>
          Back to Companies
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/companies")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Companies
        </Button>
        <span className="text-sm text-muted-foreground">/ {company.name}</span>
      </div>

      {/* Company Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <Building2 className="h-7 w-7 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {company.industry && <span>{company.industry}</span>}
              {company.industry && <span>&#183;</span>}
              <Badge variant="secondary" className="rounded-full">
                Score: {company.ranking_score.toFixed(1)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {company.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-4 w-4" />
                Website
              </a>
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              setEditForm({
                name: company.name,
                description: company.description,
                industry: company.industry,
                website: company.website,
                logo_url: company.logo_url,
              })
              setEditOpen(true)
            }}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                {company.description ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {company.description}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">No description provided.</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Ranking Score</CardTitle>
                <CardDescription>
                  Based on 40% document coverage, 30% entity extraction, 30% relationship mapping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{company.ranking_score.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">out of 100</p>
                  </div>
                  <div className="ml-auto h-3 w-48 rounded-full bg-muted">
                    <div
                      className="h-3 rounded-full bg-primary transition-all"
                      style={{ width: `${company.ranking_score}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium">{company.industry ?? "--"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Website</span>
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-medium text-primary"
                    >
                      <Globe className="h-3 w-3" />
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <span className="font-medium">--</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Company ID</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{company.id}</code>
                </div>
                {company.created_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(company.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Upload Zone */}
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50"
            )}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragOver(false)
              handleFiles(e.dataTransfer.files)
            }}
          >
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">
              {uploadMutation.isPending ? "Uploading..." : "Drag and drop files here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, DOCX, XLSX, PPTX, TXT, CSV, audio, and video files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv,.mp3,.mp4,.wav,.avi,.mov,.mkv"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files)
                e.target.value = ""
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Browse Files
            </Button>
          </div>

          {/* Document List */}
          <Card className="rounded-2xl">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  {docsLoading ? "Loading..." : `${documents.length} files`}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {docsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No documents yet. Upload files to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const status = statusConfig[doc.processing_status] ?? statusConfig.pending
                    const StatusIcon = status.icon
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                          <File className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{doc.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.doc_type} &middot;{" "}
                            {doc.file_size > 1024 * 1024
                              ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB`
                              : `${(doc.file_size / 1024).toFixed(0)} KB`}
                            {doc.error_message && (
                              <span className="ml-1 text-red-500">-- {doc.error_message}</span>
                            )}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                            status.bg,
                            status.color
                          )}
                        >
                          <StatusIcon
                            className={cn(
                              "h-3 w-3",
                              doc.processing_status === "processing" && "animate-spin"
                            )}
                          />
                          {doc.processing_status}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteDocMutation.mutate(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "chat" && (
        <Card className="rounded-2xl">
          <CardContent className="flex h-96 flex-col items-center justify-center p-12 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Chat about {company.name}</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Start a new chat session to ask questions about this company&apos;s documents.
              Lumio will ground answers in your indexed data with source attribution.
            </p>
            {sessions?.items && sessions.items.length > 0 && (
              <div className="mt-4 w-full max-w-sm space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Existing sessions ({sessions.items.length})
                </p>
                {sessions.items.slice(0, 3).map((s) => (
                  <Button
                    key={s.id}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => navigate(`/chat/${s.id}`)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </Button>
                ))}
              </div>
            )}
            <Button
              className="mt-6"
              onClick={() => createSessionMutation.mutate()}
              disabled={createSessionMutation.isPending}
            >
              {createSessionMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              New Chat Session
              <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={editForm.name ?? ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Input
                value={editForm.industry ?? ""}
                onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input
                value={editForm.website ?? ""}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={editForm.description ?? ""}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Logo URL</Label>
              <Input
                value={editForm.logo_url ?? ""}
                onChange={(e) => setEditForm({ ...editForm, logo_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateMutation.mutate(editForm)}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
