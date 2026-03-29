import axios from "axios"
import type {
  AuthResponse,
  Company,
  CompanyCreate,
  CompanyUpdate,
  Document,
  DocumentDetail,
  DocumentUploadResponse,
  MultipartUploadResponse,
  ChatSession,
  ChatSessionDetail,
  ChatSessionCreate,
  ChatMessageResponse,
  Contract,
  DependencyBreakdown,
  RankingEntry,
  AnalyticsSummary,
  KnowledgeGraph,
  Settings,
  SettingsUpdate,
  PaginatedResponse,
} from "@/types"

// ── Axios instance ───────────────────────────────────

const api = axios.create({ baseURL: "/api/v1" })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lumio-token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url ?? ""
    const isAuthRoute = url.startsWith("/auth/")
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("lumio-token")
      localStorage.removeItem("lumio-auth")
      window.location.href = "/auth"
    }
    return Promise.reject(err)
  },
)

// ── Auth ─────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data),

  register: (email: string, password: string, display_name?: string) =>
    api.post<AuthResponse>("/auth/register", { email, password, display_name }).then((r) => r.data),
}

// ── Companies ────────────────────────────────────────

export const companiesApi = {
  list: (params?: { page?: number; page_size?: number; search?: string }) =>
    api.get<PaginatedResponse<Company>>("/companies", { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<Company>(`/companies/${id}`).then((r) => r.data),

  create: (data: CompanyCreate) =>
    api.post<Company>("/companies", data).then((r) => r.data),

  update: (id: string, data: CompanyUpdate) =>
    api.patch<Company>(`/companies/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/companies/${id}`),

  enrich: (id: string, vat_number?: string) =>
    api.post<Company>(`/companies/${id}/enrich`, vat_number ? { vat_number } : undefined).then((r) => r.data),
}

// ── Documents ────────────────────────────────────────

export const documentsApi = {
  list: (companyId: string) =>
    api.get<{ items: Document[]; total: number }>(`/companies/${companyId}/documents`).then((r) => r.data),

  get: (companyId: string, docId: string) =>
    api.get<DocumentDetail>(`/companies/${companyId}/documents/${docId}`).then((r) => r.data),

  upload: (companyId: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return api.post<DocumentUploadResponse>(`/companies/${companyId}/documents`, form).then((r) => r.data)
  },

  uploadMultipart: (companyId: string, files: File[]) => {
    const form = new FormData()
    files.forEach((f) => form.append("files", f))
    return api.post<MultipartUploadResponse>(`/companies/${companyId}/documents/multipart`, form).then((r) => r.data)
  },

  delete: (companyId: string, docId: string) =>
    api.delete(`/companies/${companyId}/documents/${docId}`),
}

// ── Chat (company-scoped) ────────────────────────────

export const chatApi = {
  listSessions: (companyId?: string) =>
    api.get<{ items: ChatSession[]; total: number }>("/chat/sessions", { params: companyId ? { company_id: companyId } : undefined }).then((r) => r.data),

  createSession: (data: ChatSessionCreate) =>
    api.post<ChatSession>("/chat/sessions", data).then((r) => r.data),

  getSession: (id: string) =>
    api.get<ChatSessionDetail>(`/chat/sessions/${id}`).then((r) => r.data),

  sendMessage: (sessionId: string, content: string) =>
    api.post<ChatMessageResponse>(`/chat/sessions/${sessionId}/messages`, { content }).then((r) => r.data),

  deleteSession: (id: string) =>
    api.delete(`/chat/sessions/${id}`),

  getWsUrl: (sessionId: string) => {
    const token = localStorage.getItem("lumio-token") ?? ""
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
    return `${proto}//${window.location.host}/api/v1/chat/sessions/${sessionId}/ws?token=${token}`
  },
}

// ── General Chat (cross-company) ────────────────────

export const generalChatApi = {
  listSessions: () =>
    api.get<{ items: ChatSession[]; total: number }>("/general-chat/sessions").then((r) => r.data),

  createSession: (title?: string) =>
    api.post<ChatSession>("/general-chat/sessions", { title }).then((r) => r.data),

  getSession: (id: string) =>
    api.get<ChatSessionDetail>(`/general-chat/sessions/${id}`).then((r) => r.data),

  deleteSession: (id: string) =>
    api.delete(`/general-chat/sessions/${id}`),

  getWsUrl: (sessionId: string) => {
    const token = localStorage.getItem("lumio-token") ?? ""
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
    return `${proto}//${window.location.host}/api/v1/general-chat/sessions/${sessionId}/ws?token=${token}`
  },
}

// ── Contracts ────────────────────────────────────────

export const contractsApi = {
  list: (companyId: string) =>
    api.get<{ items: Contract[]; total: number }>(`/companies/${companyId}/contracts`).then((r) => r.data),

  getDependency: (companyId: string) =>
    api.get<DependencyBreakdown>(`/companies/${companyId}/contracts/client-score`).then((r) => r.data),

  updateCriticality: (companyId: string, contractId: string, criticality: number) =>
    api.patch<Contract>(`/companies/${companyId}/contracts/${contractId}/criticality`, { criticality }).then((r) => r.data),
}

// ── Rankings ─────────────────────────────────────────

export const rankingsApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    api.get<{ items: RankingEntry[]; total: number }>("/rankings", { params }).then((r) => r.data),

  recompute: (companyId: string) =>
    api.post(`/rankings/${companyId}/recompute`).then((r) => r.data),
}

// ── Analytics ────────────────────────────────────────

export const analyticsApi = {
  summary: (days?: number) =>
    api.get<AnalyticsSummary>("/analytics", { params: days ? { days } : undefined }).then((r) => r.data),

  graph: (companyId: string) =>
    api.get<KnowledgeGraph>(`/analytics/graph/${companyId}`).then((r) => r.data),
}

// ── Settings ─────────────────────────────────────────

export const settingsApi = {
  get: () =>
    api.get<Settings>("/settings").then((r) => r.data),

  update: (data: SettingsUpdate) =>
    api.patch<Settings>("/settings", data).then((r) => r.data),
}
