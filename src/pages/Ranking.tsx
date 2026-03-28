import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  RefreshCw,
  Loader2,
  Trophy,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { rankingsApi } from "@/lib/api"

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
      <span className="w-12 text-right text-sm tabular-nums">{value.toFixed(1)}</span>
    </div>
  )
}

export default function Ranking() {
  const queryClient = useQueryClient()
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [sortKey, setSortKey] = useState<"ranking_score" | "document_count" | "completeness">("ranking_score")

  const { data: rankingsData, isLoading } = useQuery({
    queryKey: ["rankings"],
    queryFn: () => rankingsApi.list(),
  })

  const recomputeMutation = useMutation({
    mutationFn: (companyId: string) => rankingsApi.recompute(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rankings"] })
    },
  })

  const rankings = rankingsData?.items ?? (Array.isArray(rankingsData) ? rankingsData : [])

  const sorted = [...rankings].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey]
    return sortDir === "asc" ? diff : -diff
  })

  function handleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const SortIcon = ({ column }: { column: typeof sortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 opacity-50" />
    return sortDir === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Rankings</h1>
          <p className="text-muted-foreground">
            Rankings based on 40% document coverage, 30% entity extraction, 30% relationship mapping.
          </p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : rankings.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No rankings yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add companies and upload documents to generate rankings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Company</th>
                  <th className="px-4 py-3">
                    <button
                      onClick={() => handleSort("ranking_score")}
                      className="flex items-center gap-1 text-xs font-medium uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Ranking Score
                      <SortIcon column="ranking_score" />
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button
                      onClick={() => handleSort("document_count")}
                      className="flex items-center gap-1 text-xs font-medium uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Documents
                      <SortIcon column="document_count" />
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button
                      onClick={() => handleSort("completeness")}
                      className="flex items-center gap-1 text-xs font-medium uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Completeness
                      <SortIcon column="completeness" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, idx) => (
                  <tr
                    key={row.company_id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                          idx === 0 && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                          idx === 1 && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                          idx === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                          idx > 2 && "text-muted-foreground"
                        )}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-medium">{row.company_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar value={row.ranking_score} />
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums">
                      {row.document_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${row.completeness}%` }}
                          />
                        </div>
                        <span className="text-sm tabular-nums">{row.completeness.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => recomputeMutation.mutate(row.company_id)}
                        disabled={recomputeMutation.isPending}
                      >
                        {recomputeMutation.isPending ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1 h-3 w-3" />
                        )}
                        Recompute
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
