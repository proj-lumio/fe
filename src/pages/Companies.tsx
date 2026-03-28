import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { companiesApi } from "@/lib/api"
import { useTranslations } from "@/hooks/useTranslations"
import { LiquidInput } from "@/components/LiquidInput"
import { Loader2, Plus, Search } from "lucide-react"
import type { CompanyCreate, Company } from "@/types"

export default function Companies() {
  const navigate = useNavigate()
  const t = useTranslations()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [entered, setEntered] = useState(false)

  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formIndustry, setFormIndustry] = useState("")
  const [formWebsite, setFormWebsite] = useState("")

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true))
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ["companies", debouncedSearch],
    queryFn: () =>
      companiesApi.list(debouncedSearch ? { search: debouncedSearch } : undefined),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CompanyCreate) => companiesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      resetForm()
    },
  })

  function resetForm() {
    setShowCreate(false)
    setFormName("")
    setFormDescription("")
    setFormIndustry("")
    setFormWebsite("")
  }

  function handleCreate() {
    if (!formName.trim()) return
    createMutation.mutate({
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      industry: formIndustry.trim() || undefined,
      website: formWebsite.trim() || undefined,
    })
  }

  const companies: Company[] = data?.items ?? []

  return (
    <div
      className="pt-2 transition-all duration-500"
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
        filter: entered ? "blur(0px)" : "blur(12px)",
      }}
    >
      {/* Header — title left, action right */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold uppercase text-white">{t.companies.title}</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-transform duration-200 active:scale-[0.98] shrink-0"
          style={{ borderRadius: 12, background: "#1f1f1f" }}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t.companies.add}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a9a9a9]" />
        <LiquidInput
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t.companies.search}
          className="!pl-11"
        />
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>
          <div className="liquid-card-strong w-full max-w-lg p-6 sm:p-8 my-auto">
            <h2 className="mb-6 text-lg font-bold uppercase text-white">{t.companies.add}</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-[#a9a9a9]">{t.companies.name}</label>
                <LiquidInput value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={t.companies.name} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[#a9a9a9]">{t.companies.description}</label>
                <LiquidInput value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder={t.companies.description} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[#a9a9a9]">{t.companies.industry}</label>
                <LiquidInput value={formIndustry} onChange={(e) => setFormIndustry(e.target.value)} placeholder={t.companies.industry} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[#a9a9a9]">{t.companies.website}</label>
                <LiquidInput value={formWebsite} onChange={(e) => setFormWebsite(e.target.value)} placeholder={t.companies.website} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="liquid-card-btn px-5 py-2.5 text-sm text-white transition-transform duration-200 active:scale-[0.98]"
                style={{ borderRadius: 12 }}
              >
                {t.companies.cancel}
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || !formName.trim()}
                className="liquid-card-btn flex items-center gap-2 bg-[#7966ff] px-5 py-2.5 text-sm font-medium text-white transition-transform duration-200 disabled:opacity-50 active:scale-[0.98]"
                style={{ borderRadius: 12 }}
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.companies.create}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="liquid-card h-28 animate-pulse p-5" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && companies.length === 0 && (
        <div className="liquid-card p-6">
          <p className="text-sm text-[#a9a9a9] text-center">{t.companies.no_companies}</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && companies.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company, i) => (
            <button
              key={company.id}
              onClick={() => navigate(`/companies/${company.id}`)}
              className="liquid-card p-5 text-left transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              style={{
                opacity: entered ? 1 : 0,
                transform: entered ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 400ms ease ${i * 150}ms, transform 400ms ease ${i * 150}ms`,
              }}
            >
              <h3 className="mb-1 text-base font-bold text-white">{company.name}</h3>
              {company.industry && (
                <p className="mb-3 text-xs text-[#a9a9a9]">{company.industry}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#a9a9a9]">{t.companies.ranking_score}</span>
                <span className="text-sm font-medium text-[#7966ff]">{company.ranking_score.toFixed(1)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
