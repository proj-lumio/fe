import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Building2,
  FileText,
  MessageSquare,
  Coins,
  Plus,
  Upload,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { companiesApi, chatApi, analyticsApi } from "@/lib/api"

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ["companies", { page: 1, page_size: 5 }],
    queryFn: () => companiesApi.list({ page: 1, page_size: 5 }),
  })

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["chatSessions"],
    queryFn: () => chatApi.listSessions(),
  })

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics", 30],
    queryFn: () => analyticsApi.get(30),
  })

  const totalCompanies = companiesData?.total ?? 0
  const totalSessions = sessionsData?.items?.length ?? 0
  const totalTokens = analyticsData?.summary?.total_tokens ?? 0
  const recentCompanies = companiesData?.items ?? []

  const statsCards = [
    {
      title: "Total Companies",
      value: totalCompanies,
      icon: Building2,
      loading: companiesLoading,
    },
    {
      title: "Total Documents",
      value: "--",
      icon: FileText,
      loading: false,
    },
    {
      title: "Chat Sessions",
      value: totalSessions,
      icon: MessageSquare,
      loading: sessionsLoading,
    },
    {
      title: "Total Tokens",
      value: totalTokens.toLocaleString(),
      icon: Coins,
      loading: analyticsLoading,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back. Here&apos;s an overview of your workspace.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/chat")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Start Chat
          </Button>
          <Button onClick={() => navigate("/companies")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3">
                {stat.loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Companies */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
            <CardDescription>Latest companies in your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            {companiesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentCompanies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Building2 className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No companies yet. Add your first company to get started.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate("/companies")}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Company
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                    onClick={() => navigate(`/companies/${company.id}`)}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{company.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {company.industry ?? "No industry"} &middot; Score: {company.ranking_score.toFixed(1)}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/companies")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/chat")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Start a Chat
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/companies")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/ranking")}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Rankings
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/analytics")}
            >
              <Coins className="mr-2 h-4 w-4" />
              Usage Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
