// ── Auth ──────────────────────────────────────────────

export interface User {
  id: string
  email: string
  display_name: string | null
  is_active: boolean
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

// ── Companies ────────────────────────────────────────

export interface Company {
  id: string
  owner_id: string
  name: string
  description: string | null
  industry: string | null
  website: string | null
  logo_url: string | null
  ranking_score: number
  created_at: string
  updated_at: string
}

export interface CompanyCreate {
  name: string
  description?: string
  industry?: string
  website?: string
  logo_url?: string
}

export interface CompanyUpdate {
  name?: string
  description?: string
  industry?: string
  website?: string
  logo_url?: string
}

// ── Documents ────────────────────────────────────────

export type DocType = "pdf" | "docx" | "xlsx" | "pptx" | "txt" | "csv" | "audio" | "video" | "image"
export type ProcessingStatus = "pending" | "completed" | "error"

export interface Document {
  id: string
  company_id: string
  filename: string
  doc_type: DocType
  file_url: string
  file_size: number
  raw_text: string | null
  metadata: Record<string, unknown> | null
  processing_status: ProcessingStatus
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface DocumentDetail extends Document {
  chunks_count: number
}

export interface DocumentUploadResponse {
  id: string
  filename: string
  processing_status: ProcessingStatus
  message?: string
}

export interface MultipartUploadResponse {
  items: DocumentUploadResponse[]
  total: number
  skipped: number
  message: string
}

// ── Chat ─────────────────────────────────────────────

export interface ChatSession {
  id: string
  user_id: string
  company_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  user_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[]
}

export interface ChatSource {
  document_id: string
  chunk_id: string
  text: string
  score: number
}

export interface ChatMessageResponse {
  message: ChatMessage
  sources: ChatSource[]
}

export interface ChatSessionCreate {
  company_id: string
  title?: string
}

// ── Contracts ────────────────────────────────────────

export interface Contract {
  id: string
  company_id: string
  document_id: string
  extracted_terms: Record<string, unknown>
  criticality_auto: number
  criticality_manual: number | null
  dependency_score: number
  created_at: string
}

export interface DependencyBreakdown {
  company_id: string
  total_dependency_score: number
  spend_weight: number
  spend_score: number
  lockin_weight: number
  lockin_score: number
  sla_risk_weight: number
  sla_risk_score: number
  criticality_weight: number
  criticality_score: number
  contracts: Contract[]
}

// ── Rankings ─────────────────────────────────────────

export interface RankingEntry {
  company_id: string
  company_name: string
  ranking_score: number
  client_score: number
  total_annual_revenue_eur: number
  document_count: number
  contract_count: number
  completeness: number
}

// ── Analytics ────────────────────────────────────────

export interface UsageByDay {
  date: string
  tokens: number
  documents: number
  messages: number
}

export interface AnalyticsSummary {
  total_tokens_used: number
  total_credits_used: number
  plan: string
  credits_remaining: number
  documents_processed: number
  chat_messages: number
  usage_by_day: UsageByDay[]
  system_costs: Record<string, unknown>
}

export interface GraphNode {
  id: string
  label: string
  group: string
  type?: string
}

export interface GraphEdge {
  source: string
  target: string
  relation: string
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// ── Settings ─────────────────────────────────────────

export interface Settings {
  theme: "light" | "dark"
  language: "it" | "en"
  notifications_enabled: boolean
  preferences: Record<string, unknown> | null
}

export interface SettingsUpdate {
  theme?: "light" | "dark"
  language?: "it" | "en"
  notifications_enabled?: boolean
  preferences?: Record<string, unknown>
}

// ── Pagination ───────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
