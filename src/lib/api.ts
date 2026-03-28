import axios from "axios"
import { getIdToken } from "./firebase"
import type {
  Company, CompanyCreate, CompanyUpdate, PaginatedResponse,
  Document, DocumentUploadResponse,
  ChatSession, ChatSendResponse,
  CompanyRanking, AnalyticsData, UserSettings
} from "@/types"

const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(async (config) => {
  const token = await getIdToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

// Companies
export const companiesApi = {
  list: (params?: { page?: number; page_size?: number; search?: string }) =>
    api.get<PaginatedResponse<Company>>("/companies", { params }).then(r => r.data),

  get: (id: string) =>
    api.get<Company>(`/companies/${id}`).then(r => r.data),

  create: (data: CompanyCreate) =>
    api.post<Company>("/companies", data).then(r => r.data),

  update: (id: string, data: CompanyUpdate) =>
    api.patch<Company>(`/companies/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/companies/${id}`),
}

// Documents
export const documentsApi = {
  list: (companyId: string) =>
    api.get<{ items: Document[]; total: number }>(`/companies/${companyId}/documents`).then(r => r.data),

  get: (companyId: string, docId: string) =>
    api.get<Document>(`/companies/${companyId}/documents/${docId}`).then(r => r.data),

  upload: (companyId: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return api.post<DocumentUploadResponse>(`/companies/${companyId}/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data)
  },

  uploadMultiple: (companyId: string, files: File[]) => {
    const form = new FormData()
    files.forEach(f => form.append("files", f))
    return api.post<DocumentUploadResponse[]>(`/companies/${companyId}/documents/multipart`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data)
  },

  delete: (companyId: string, docId: string) =>
    api.delete(`/companies/${companyId}/documents/${docId}`),
}

// Chat
export const chatApi = {
  listSessions: (companyId?: string) =>
    api.get<{ items: ChatSession[]; total: number }>("/chat/sessions", {
      params: companyId ? { company_id: companyId } : undefined,
    }).then(r => r.data),

  createSession: (companyId: string, title?: string) =>
    api.post<ChatSession>("/chat/sessions", {
      company_id: companyId,
      title: title || "New Chat",
    }).then(r => r.data),

  getSession: (sessionId: string) =>
    api.get<ChatSession>(`/chat/sessions/${sessionId}`).then(r => r.data),

  sendMessage: (sessionId: string, content: string) =>
    api.post<ChatSendResponse>(`/chat/sessions/${sessionId}/messages`, { content }).then(r => r.data),

  deleteSession: (sessionId: string) =>
    api.delete(`/chat/sessions/${sessionId}`),
}

// Rankings
export const rankingsApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    api.get<{ items: CompanyRanking[]; total: number }>("/rankings", { params }).then(r => r.data),

  recompute: (companyId: string) =>
    api.post<{ company_id: string; ranking_score: number }>(`/rankings/${companyId}/recompute`).then(r => r.data),
}

// Analytics
export const analyticsApi = {
  get: (days?: number) =>
    api.get<AnalyticsData>("/analytics", { params: days ? { days } : undefined }).then(r => r.data),
}

// Settings
export const settingsApi = {
  get: () =>
    api.get<UserSettings>("/settings").then(r => r.data),

  update: (data: Partial<UserSettings>) =>
    api.patch<UserSettings>("/settings", data).then(r => r.data),
}

// CircleBack
export const circlebackApi = {
  listMeetings: (params?: { limit?: number; offset?: number }) =>
    api.get("/circleback/meetings", { params }).then(r => r.data),

  getMeeting: (id: string) =>
    api.get(`/circleback/meetings/${id}`).then(r => r.data),

  getTranscript: (id: string) =>
    api.get(`/circleback/meetings/${id}/transcript`).then(r => r.data),

  getSummary: (id: string) =>
    api.get(`/circleback/meetings/${id}/summary`).then(r => r.data),

  getActionItems: (id: string) =>
    api.get(`/circleback/meetings/${id}/action-items`).then(r => r.data),

  ingestTranscript: (meetingId: string, companyId: string) =>
    api.post(`/circleback/meetings/${meetingId}/ingest`, null, {
      params: { company_id: companyId },
    }).then(r => r.data),
}

// Health
export const healthApi = {
  check: () => api.get("/health").then(r => r.data),
}

export default api
