import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Building2, FileText, MessageSquare, Coins } from "lucide-react"
import { companiesApi, analyticsApi, chatApi } from "@/lib/api"
import { useTranslations } from "@/hooks/useTranslations"

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/[0.06] ${className}`}
    />
  )
}

function StatSkeleton() {
  return (
    <div className="liquid-card p-5 flex flex-col gap-3">
      <Skeleton className="h-5 w-5 !rounded-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-16" />
    </div>
  )
}

function CompanyCardSkeleton() {
  return (
    <div className="liquid-card p-5">
      <Skeleton className="h-5 w-32 mb-2" />
      <Skeleton className="h-4 w-20 mb-3" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

export default function Dashboard() {
  const t = useTranslations()

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesApi.list({ page: 1, page_size: 5 }),
  })

  const analyticsQuery = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: () => analyticsApi.summary(),
  })

  const sessionsQuery = useQuery({
    queryKey: ["chatSessions"],
    queryFn: () => chatApi.listSessions(),
  })

  const isLoading = companiesQuery.isLoading || analyticsQuery.isLoading

  if (isLoading) {
    return (
      <div className="space-y-8 pt-2">
        <section>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)}
          </div>
        </section>
        <section>
          <Skeleton className="h-6 w-44 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <CompanyCardSkeleton key={i} />)}
          </div>
        </section>
        <section>
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-11 w-36 !rounded-xl" />)}
          </div>
        </section>
      </div>
    )
  }

  const isError = companiesQuery.isError || analyticsQuery.isError

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#a9a9a9]">{t.common.error}</p>
      </div>
    )
  }

  const analytics = analyticsQuery.data
  const companies = companiesQuery.data
  const sessions = sessionsQuery.data

  const stats = [
    {
      icon: Building2,
      label: t.dashboard.total_companies,
      value: companies?.total ?? 0,
    },
    {
      icon: FileText,
      label: t.dashboard.total_documents,
      value: analytics?.summary?.request_count ?? 0,
    },
    {
      icon: MessageSquare,
      label: t.dashboard.active_sessions,
      value: sessions?.total ?? 0,
    },
    {
      icon: Coins,
      label: t.dashboard.total_tokens,
      value: analytics?.summary?.total_tokens?.toLocaleString() ?? "0",
    },
  ]

  return (
    <div className="space-y-8 pt-2">
      {/* Stats */}
      <section>
        <h2
          className="text-xl font-bold text-white uppercase mb-4"
          style={{ animation: "fadeInUp 500ms both" }}
        >
          {t.dashboard.title}
        </h2>
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
      </section>

      {/* Recent Companies */}
      <section style={{ animation: "fadeInUp 500ms 750ms both" }}>
        <h2 className="text-xl font-bold text-white mb-4 uppercase">{t.dashboard.recent_companies}</h2>
        {companies && companies.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.items.map((company, i) => (
              <Link
                key={company.id}
                to={`/companies/${company.id}`}
                className="liquid-card p-5 block hover:brightness-110 transition-all duration-200"
                style={{ animation: `fadeInUp 500ms ${900 + i * 100}ms both` }}
              >
                <h3 className="text-white font-medium mb-1">{company.name}</h3>
                {company.industry && (
                  <p className="text-sm text-[#a9a9a9] mb-2">{company.industry}</p>
                )}
                <p className="text-xs text-[#22cfff]">
                  {t.companies.ranking_score}: {company.ranking_score}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="liquid-card p-6">
            <p className="text-[#a9a9a9] text-sm">{t.dashboard.no_companies}</p>
          </div>
        )}
      </section>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
