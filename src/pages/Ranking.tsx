import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import { rankingsApi } from "@/lib/api"
import { useTranslations } from "@/hooks/useTranslations"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.06] ${className}`} />
}

export default function Ranking() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [recomputingId, setRecomputingId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["rankings"],
    queryFn: () => rankingsApi.list(),
  })

  const recomputeMutation = useMutation({
    mutationFn: (companyId: string) => {
      setRecomputingId(companyId)
      return rankingsApi.recompute(companyId)
    },
    onSettled: () => {
      setRecomputingId(null)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rankings"] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6 pt-2">
        <Skeleton className="h-8 w-40" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#a9a9a9]">{t.common.error}</p>
      </div>
    )
  }

  const rankings = data?.items ?? []

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ animation: "fadeInUp 500ms both" }}
      >
        <h1 className="text-xl font-bold uppercase text-white">
          {t.ranking.title}
        </h1>
      </div>

      {rankings.length === 0 ? (
        <div className="liquid-card p-6" style={{ animation: "fadeInUp 500ms 150ms both" }}>
          <p className="text-[#a9a9a9] text-sm text-center">{t.common.no_data}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rankings.map((entry, i) => {
            const isThisRecomputing = recomputingId === entry.company_id
            return (
              <div
                key={entry.company_id}
                className="liquid-card p-5"
                style={{ animation: `fadeInUp 500ms ${(i + 1) * 100}ms both` }}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left — position + name */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className="text-2xl font-bold text-[#7966ff] w-8 shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{entry.company_name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span className="text-xs text-[#a9a9a9]">
                          {t.ranking.score}: <span className="text-[#22cfff] font-medium">{(entry.ranking_score ?? 0).toFixed(1)}</span>
                        </span>
                        <span className="text-xs text-[#a9a9a9]">
                          {t.ranking.client_score}: <span className="text-white">{(entry.client_score ?? 0).toFixed(1)}</span>
                        </span>
                        <span className="text-xs text-[#a9a9a9] hidden sm:inline">
                          {t.ranking.completeness}: <span className="text-white">{((entry.completeness ?? 0) * 100).toFixed(0)}%</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right — recompute */}
                  <button
                    onClick={() => recomputeMutation.mutate(entry.company_id)}
                    disabled={recomputeMutation.isPending}
                    className="liquid-card-btn flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition-transform duration-200 active:scale-[0.98] disabled:opacity-50 shrink-0"
                    style={{ borderRadius: 12 }}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isThisRecomputing ? "animate-spin" : ""}`}
                    />
                    <span className="hidden sm:inline">{t.ranking.recompute}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
