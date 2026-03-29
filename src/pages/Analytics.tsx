import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Coins, CreditCard, Zap, Hash } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { analyticsApi } from "@/lib/api"
import { useTranslations } from "@/hooks/useTranslations"

const PERIOD_OPTIONS = [7, 30, 90] as const

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.06] ${className}`} />
}

export default function Analytics() {
  const t = useTranslations()
  const [days, setDays] = useState<number>(30)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", days],
    queryFn: () => analyticsApi.summary(days),
  })

  if (isLoading) {
    return (
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-14" />)}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
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

  const summary = data?.summary
  const plan = data?.plan

  const stats = [
    { icon: Coins, label: t.analytics.total_tokens, value: summary?.total_tokens?.toLocaleString() ?? "0" },
    { icon: CreditCard, label: t.analytics.credits_used, value: summary?.credits_used?.toLocaleString() ?? "0" },
    { icon: Zap, label: t.analytics.credits_remaining, value: plan?.credits_remaining?.toLocaleString() ?? "0" },
    { icon: Hash, label: t.analytics.requests, value: summary?.request_count?.toLocaleString() ?? "0" },
  ]

  const chartData = (data?.by_day ?? []).map((d) => ({
    date: d.date,
    tokens: d.total_tokens,
    credits: d.credits,
  }))

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ animation: "fadeInUp 500ms both" }}
      >
        <h1 className="text-xl font-bold uppercase text-white">{t.analytics.title}</h1>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => setDays(p)}
              className={`liquid-card-btn px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                days === p ? "bg-[#7966ff] text-white" : "text-[#a9a9a9] hover:text-white"
              }`}
              style={{ borderRadius: 12 }}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="liquid-card p-5 flex flex-col gap-3"
            style={{ animation: `fadeInUp 500ms ${(i + 1) * 150}ms both` }}
          >
            <stat.icon className="w-5 h-5 text-white" />
            <span className="text-sm text-[#a9a9a9]">{stat.label}</span>
            <span className="text-2xl font-semibold text-[#7966ff]">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        className="liquid-card p-4 sm:p-6"
        style={{ animation: "fadeInUp 500ms 750ms both" }}
      >
        <h2 className="text-lg font-bold uppercase text-white mb-6">{t.analytics.usage_chart}</h2>

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-[#a9a9a9]">{t.common.no_data}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tokensFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7966ff" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#7966ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#a9a9a9" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a9a9a9" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => v.toLocaleString()} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f1f1f",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#ffffff",
                  fontFamily: "Unbounded",
                  fontSize: 13,
                }}
                labelStyle={{ color: "#a9a9a9" }}
              />
              <Area type="monotone" dataKey="tokens" stroke="#7966ff" strokeWidth={2} fill="url(#tokensFill)" name={t.analytics.total_tokens} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* By Endpoint breakdown */}
      {(data?.by_endpoint?.length ?? 0) > 0 && (
        <div
          className="liquid-card p-4 sm:p-6"
          style={{ animation: "fadeInUp 500ms 900ms both" }}
        >
          <h2 className="text-lg font-bold uppercase text-white mb-4">{t.analytics.by_endpoint}</h2>
          <div className="space-y-2">
            {data!.by_endpoint.map((ep) => (
              <div key={ep.endpoint} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="text-sm text-white">{ep.endpoint}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#a9a9a9]">{ep.request_count} req</span>
                  <span className="text-sm font-medium text-[#7966ff]">{ep.credits.toLocaleString()} credits</span>
                </div>
              </div>
            ))}
          </div>
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
