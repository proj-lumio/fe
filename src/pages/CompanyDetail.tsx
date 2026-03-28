import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { companiesApi, documentsApi, contractsApi } from "@/lib/api"
import { useTranslations } from "@/hooks/useTranslations"
import { LiquidInput } from "@/components/LiquidInput"
import {
  Trash2,
  Upload,
  FileText,
  Globe,
  Building2,
  Loader2,
  Pencil,
  ChevronRight,
} from "lucide-react"
import type { CompanyUpdate, Document, Contract } from "@/types"

type Tab = "overview" | "documents" | "contracts"

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  completed: "#22c55e",
  error: "#ff4b44",
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const t = useTranslations()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [entered, setEntered] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editIndustry, setEditIndustry] = useState("")
  const [editWebsite, setEditWebsite] = useState("")

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true))
  }, [])

  // ── Queries ─────────────────────────────────────────

  const {
    data: company,
    isLoading: companyLoading,
  } = useQuery({
    queryKey: ["company", id],
    queryFn: () => companiesApi.get(id!),
    enabled: !!id,
  })

  const { data: documentsData, isLoading: docsLoading } = useQuery({
    queryKey: ["documents", id],
    queryFn: async () => {
      try {
        return await documentsApi.list(id!)
      } catch {
        return { items: [] as Document[], total: 0 }
      }
    },
    enabled: !!id,
  })

  const { data: contractsData, isLoading: contractsLoading } = useQuery({
    queryKey: ["contracts", id],
    queryFn: async () => {
      try {
        return await contractsApi.list(id!)
      } catch {
        return { items: [] as Contract[], total: 0 }
      }
    },
    enabled: !!id,
  })

  const documents: Document[] = documentsData?.items ?? []
  const contracts: Contract[] = contractsData?.items ?? []

  // ── Mutations ───────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: (data: CompanyUpdate) => companiesApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", id] })
      setShowEdit(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => companiesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      navigate("/companies")
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => documentsApi.uploadMultipart(id!, files),
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

  // ── Handlers ────────────────────────────────────────

  function openEdit() {
    if (!company) return
    setEditName(company.name)
    setEditDescription(company.description ?? "")
    setEditIndustry(company.industry ?? "")
    setEditWebsite(company.website ?? "")
    setShowEdit(true)
  }

  function handleUpdate() {
    updateMutation.mutate({
      name: editName.trim() || undefined,
      description: editDescription.trim() || undefined,
      industry: editIndustry.trim() || undefined,
      website: editWebsite.trim() || undefined,
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    uploadMutation.mutate(Array.from(files))
    e.target.value = ""
  }

  // ── Loading ─────────────────────────────────────────

  if (companyLoading) {
    return (
      <div className="space-y-6 pt-2">
        <div className="h-5 w-48 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="h-4 w-40 animate-pulse rounded-lg bg-white/[0.06]" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="h-10 w-24 animate-pulse rounded-xl bg-white/[0.06]" />
          </div>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 w-28 animate-pulse rounded-xl bg-white/[0.06]" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="liquid-card h-20 animate-pulse p-5" />
          ))}
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[#a9a9a9]">{t.common.error}</p>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t.companies.overview },
    { key: "documents", label: t.companies.documents },
    { key: "contracts", label: t.companies.contracts },
  ]

  return (
    <div
      className="pt-2 transition-all duration-500"
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? "none" : "translateY(20px) scale(0.95)",
        filter: entered ? "none" : "blur(12px)",
      }}
    >
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[13px] min-w-0 overflow-hidden">
        <Link to="/companies" className="text-[#a9a9a9] transition-colors hover:text-white shrink-0">
          {t.nav.companies}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-[#a9a9a9]/50 shrink-0" />
        <span className="text-white font-medium truncate">{company.name}</span>
      </nav>

      {/* Header — title left, actions right on same line */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold uppercase text-white truncate">{company.name}</h1>
          {company.industry && (
            <p className="mt-1 text-sm text-[#a9a9a9]">{company.industry}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={openEdit}
            className="liquid-card-btn flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-transform duration-200 active:scale-[0.98]"
            style={{ borderRadius: 12 }}
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">{t.companies.edit}</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-transform duration-200 active:scale-[0.98]"
            style={{
              borderRadius: 12,
              background: "rgba(255, 75, 68, 0.15)",
            }}
          >
            <Trash2 className="h-4 w-4 text-[#ff4b44]" />
            <span className="text-[#ff4b44] hidden sm:inline">{t.companies.delete}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="liquid-card-strong w-full max-w-sm p-8 text-center">
            <p className="mb-6 text-sm text-white">{t.companies.delete_confirm}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="liquid-card-btn px-5 py-2.5 text-sm text-white transition-transform duration-200 active:scale-[0.98]"
                style={{ borderRadius: 12 }}
              >
                {t.companies.cancel}
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-transform duration-200 disabled:opacity-50 active:scale-[0.98]"
                style={{
                  borderRadius: 12,
                  background: "rgba(255, 75, 68, 0.8)",
                }}
              >
                {deleteMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t.companies.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="liquid-card-strong w-full max-w-lg p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-bold uppercase text-white">{t.companies.edit}</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-[#a9a9a9]">
                  {t.companies.name}
                </label>
                <LiquidInput
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t.companies.name}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[#a9a9a9]">
                  {t.companies.description}
                </label>
                <LiquidInput
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder={t.companies.description}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[#a9a9a9]">
                  {t.companies.industry}
                </label>
                <LiquidInput
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  placeholder={t.companies.industry}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[#a9a9a9]">
                  {t.companies.website}
                </label>
                <LiquidInput
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder={t.companies.website}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEdit(false)}
                className="liquid-card-btn px-5 py-2.5 text-sm text-white transition-transform duration-200 active:scale-[0.98]"
                style={{ borderRadius: 12 }}
              >
                {t.companies.cancel}
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="liquid-card-btn flex items-center gap-2 bg-[#7966ff] px-5 py-2.5 text-sm font-medium text-white transition-transform duration-200 disabled:opacity-50 active:scale-[0.98]"
                style={{ borderRadius: 12 }}
              >
                {updateMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t.companies.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
            style={{
              borderRadius: 12,
              color: activeTab === tab.key ? "#fff" : "#a9a9a9",
              background:
                activeTab === tab.key
                  ? "rgba(121, 102, 255, 0.2)"
                  : "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="liquid-card flex items-center gap-3 p-5">
            <Globe className="h-5 w-5 text-[#22cfff] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-[#a9a9a9]">{t.companies.website}</p>
              <p className="text-sm text-white truncate">{company.website || "-"}</p>
            </div>
          </div>
          <div className="liquid-card flex items-center gap-3 p-5">
            <Building2 className="h-5 w-5 text-[#22cfff]" />
            <div>
              <p className="text-xs text-[#a9a9a9]">{t.companies.industry}</p>
              <p className="text-sm text-white">{company.industry || "-"}</p>
            </div>
          </div>
          <div className="liquid-card flex items-center gap-3 p-5">
            <div className="flex h-5 w-5 items-center justify-center text-sm font-bold text-[#7966ff]">
              #
            </div>
            <div>
              <p className="text-xs text-[#a9a9a9]">{t.companies.ranking_score}</p>
              <p className="text-sm font-medium text-white">
                {(company.ranking_score ?? 0).toFixed(1)}
              </p>
            </div>
          </div>
          <div className="liquid-card flex items-center gap-3 p-5">
            <FileText className="h-5 w-5 text-[#22cfff]" />
            <div>
              <p className="text-xs text-[#a9a9a9]">{t.companies.created}</p>
              <p className="text-sm text-white">
                {new Date(company.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {company.description && (
            <div className="liquid-card col-span-full p-5">
              <p className="text-xs text-[#a9a9a9] mb-1">{t.companies.description}</p>
              <p className="text-sm text-white">{company.description}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div>
          {/* Upload Area */}
          <div className="liquid-card mb-6 flex flex-col items-center justify-center gap-3 p-8">
            <Upload className="h-8 w-8 text-[#a9a9a9]" />
            <p className="text-sm text-[#a9a9a9]">{t.companies.choose_files}</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="liquid-card-btn flex items-center gap-2 bg-[#7966ff] px-5 py-2.5 text-sm font-medium text-white transition-transform duration-200 disabled:opacity-50 active:scale-[0.98]"
              style={{ borderRadius: 12 }}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.companies.uploading}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {t.companies.upload_documents}
                </>
              )}
            </button>
          </div>

          {docsLoading && (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="liquid-card h-16 animate-pulse p-4" />
              ))}
            </div>
          )}

          {!docsLoading && documents.length === 0 && (
            <div className="liquid-card p-6">
              <p className="text-[#a9a9a9] text-sm text-center">{t.companies.no_documents}</p>
            </div>
          )}

          {!docsLoading && documents.length > 0 && (
            <div className="flex flex-col gap-3">
              {documents.map((doc, i) => {
                const statusColor = STATUS_COLORS[doc.processing_status] ?? "#a9a9a9"
                return (
                  <div
                    key={doc.id}
                    className="liquid-card flex items-center justify-between p-4"
                    style={{
                      opacity: entered ? 1 : 0,
                      transform: entered ? "translateY(0)" : "translateY(12px)",
                      transition: `opacity 400ms ease ${i * 100}ms, transform 400ms ease ${i * 100}ms`,
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-[#22cfff] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {doc.filename}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {doc.doc_type && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
                              style={{
                                background: "rgba(121, 102, 255, 0.2)",
                                color: "#7966ff",
                              }}
                            >
                              {doc.doc_type}
                            </span>
                          )}
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              background: `${statusColor}22`,
                              color: statusColor,
                            }}
                          >
                            {doc.processing_status ?? "unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDocMutation.mutate(doc.id)}
                      disabled={deleteDocMutation.isPending}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#ff4b44]/15 active:scale-[0.95]"
                      style={{
                        background: "rgba(255, 75, 68, 0.1)",
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-[#ff4b44]" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "contracts" && (
        <div>
          {contractsLoading && (
            <div className="flex flex-col gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="liquid-card h-20 animate-pulse p-5" />
              ))}
            </div>
          )}

          {!contractsLoading && contracts.length === 0 && (
            <div className="liquid-card p-6">
              <p className="text-[#a9a9a9] text-sm text-center">{t.companies.no_contracts}</p>
            </div>
          )}

          {!contractsLoading && contracts.length > 0 && (
            <div className="flex flex-col gap-3">
              {contracts.map((contract, i) => {
                const crit = contract.criticality_manual ?? contract.criticality_auto ?? 0
                return (
                  <div
                    key={contract.id}
                    className="liquid-card flex items-center justify-between p-5"
                    style={{
                      opacity: entered ? 1 : 0,
                      transform: entered ? "translateY(0)" : "translateY(12px)",
                      transition: `opacity 400ms ease ${i * 100}ms, transform 400ms ease ${i * 100}ms`,
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {contract.vendor_name || contract.id.slice(0, 8) + "..."}
                      </p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs text-[#a9a9a9]">
                          {t.companies.criticality}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            background:
                              crit > 4
                                ? "rgba(255, 75, 68, 0.2)"
                                : crit > 2
                                  ? "rgba(234, 179, 8, 0.2)"
                                  : "rgba(34, 197, 94, 0.2)",
                            color:
                              crit > 4
                                ? "#ff4b44"
                                : crit > 2
                                  ? "#eab308"
                                  : "#22c55e",
                          }}
                        >
                          {crit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs text-[#a9a9a9]">
                        {t.companies.created}
                      </p>
                      <p className="text-sm font-medium text-[#22cfff]">
                        {new Date(contract.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
