import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  Zap,
  FileInput,
  FileOutput,
  Activity,
  BarChart3,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { analyticsApi } from "@/lib/api"

const dayOptions = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
] as const

export default function Analytics() {
  const [days, setDays] = useState<number>(30)

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", days],
    queryFn: () => analyticsApi.get(days),
  })

  const summary = data?.summary
  const byEndpoint = data?.by_endpoint ?? []
  const byDay = data?.by_day ?? []

  const statsCards = [
    {
      title: "Total Tokens",
      value: summary?.total_tokens?.toLocaleString() ?? "--",
      icon: Zap,
    },
    {
      title: "Prompt Tokens",
      value: summary?.total_prompt_tokens?.toLocaleString() ?? "--",
      icon: FileInput,
    },
    {
      title: "Completion Tokens",
      value: summary?.total_completion_tokens?.toLocaleString() ?? "--",
      icon: FileOutput,
    },
    {
      title: "Request Count",
      value: summary?.request_count?.toLocaleString() ?? "--",
      icon: Activity,
    },
  ]

  const maxDayTokens = Math.max(...byDay.map((d) => d.total_tokens), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Token usage and API performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Days Selector */}
          <div className="flex items-center rounded-lg border border-input bg-background p-0.5">
            {dayOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDays(option.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  days === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3">
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Token Usage by Day */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Token Usage Over Time</CardTitle>
            <CardDescription>Daily token consumption for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : byDay.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No data for the selected period.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex h-48 items-end justify-between gap-1 rounded-lg bg-muted/30 px-4 pb-4 pt-6">
                  {byDay.map((day) => {
                    const height = (day.total_tokens / maxDayTokens) * 100
                    return (
                      <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                          style={{ height: `${height}%` }}
                          title={`${day.date}: ${day.total_tokens.toLocaleString()} tokens, ${day.request_count} requests`}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {day.date.slice(5)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  Avg:{" "}
                  {(
                    byDay.reduce((s, d) => s + d.total_tokens, 0) / byDay.length
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                  tokens/day
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Endpoint */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Usage by Endpoint</CardTitle>
            <CardDescription>Token and request breakdown by API endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : byEndpoint.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No endpoint data available.
              </div>
            ) : (
              <div className="space-y-4">
                {byEndpoint.map((ep) => {
                  const maxTokens = Math.max(...byEndpoint.map((e) => e.total_tokens), 1)
                  const pct = (ep.total_tokens / maxTokens) * 100
                  return (
                    <div key={ep.endpoint} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium">{ep.endpoint}</span>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="tabular-nums">{ep.request_count} reqs</span>
                          <span className="w-20 text-right font-medium text-foreground tabular-nums">
                            {ep.total_tokens.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Table */}
      {byEndpoint.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Endpoint Breakdown</CardTitle>
            <CardDescription>Detailed usage per API endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Endpoint</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Tokens</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Requests</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {byEndpoint.map((ep) => {
                    const totalTokens = byEndpoint.reduce((s, e) => s + e.total_tokens, 0)
                    const pct = totalTokens > 0 ? (ep.total_tokens / totalTokens) * 100 : 0
                    return (
                      <tr
                        key={ep.endpoint}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{ep.endpoint}</td>
                        <td className="px-4 py-3 text-sm tabular-nums">
                          {ep.total_tokens.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm tabular-nums">
                          {ep.request_count.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground tabular-nums">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
