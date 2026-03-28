// Company (matches BE CompanyResponse)
export interface Company {
  id: string
  owner_id: string
  name: string
  description: string | null
  industry: string | null
  website: string | null
  logo_url: string | null
  ranking_score: number
  created_at: string | null
  updated_at: string | null
}

export interface CompanyCreate {
  name: string
  description?: string | null
  industry?: string | null
  website?: string | null
  logo_url?: string | null
}

export interface CompanyUpdate {
  name?: string | null
  description?: string | null
  industry?: string | null
  website?: string | null
  logo_url?: string | null
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

// Document (matches BE document schema)
export interface Document {
  id: string
  company_id: string
  filename: string
  doc_type: string
  file_url: string
  file_size: number
  raw_text: string | null
  metadata: Record<string, unknown> | null
  processing_status: "pending" | "processing" | "completed" | "failed"
  error_message: string | null
  created_at: string
  updated_at: string
  chunks_count?: number
}

export interface DocumentUploadResponse {
  id: string
  filename: string
  processing_status: string
  message?: string
}

// Chat (matches BE chat schema)
export interface ChatSession {
  id: string
  user_id: string
  company_id: string
  title: string
  created_at: string
  updated_at: string
  messages?: ChatMessage[]
}

export interface ChatMessage {
  id: string
  session_id: string
  role: "user" | "assistant"
  content: string
  tokens_used: number
  sources: ChatSources | null
  created_at: string
}

export interface ChatSources {
  vector_results: { document_id: string; score: number }[]
  graph_entities: string[]
}

export interface ChatSendResponse {
  message: ChatMessage
  sources: ChatSources
}

// Rankings (matches BE ranking response)
export interface CompanyRanking {
  company_id: string
  company_name: string
  ranking_score: number
  document_count: number
  completeness: number
}

// Analytics (matches BE analytics response)
export interface AnalyticsSummary {
  total_prompt_tokens: number
  total_completion_tokens: number
  total_tokens: number
  request_count: number
  period_start: string
  period_end: string
}

export interface AnalyticsByEndpoint {
  endpoint: string
  total_tokens: number
  request_count: number
}

export interface AnalyticsByDay {
  date: string
  total_tokens: number
  request_count: number
}

export interface AnalyticsData {
  summary: AnalyticsSummary
  by_endpoint: AnalyticsByEndpoint[]
  by_day: AnalyticsByDay[]
}

// Settings (matches BE settings)
export interface UserSettings {
  theme: string
  language: string
  notifications_enabled: boolean
  preferences: Record<string, unknown> | null
}

// CircleBack
export interface Meeting {
  id: string
  title: string
  date: string
  participants: string[]
  [key: string]: unknown
}

// User (from Firebase auth)
export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}
