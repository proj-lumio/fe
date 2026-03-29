import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { CustomCursor } from "@/components/custom_cursor"
import { ProtectedRoute } from "@/components/protected_route"
import { AppLayout } from "@/components/layout/app_layout"
import { useAuthStore } from "@/store/auth"
import { Loader2 } from "lucide-react"
import Landing from "@/pages/landing"
import Login from "@/pages/login"

const Dashboard = lazy(() => import("@/pages/dashboard"))
const Graph = lazy(() => import("@/pages/graph"))
const Companies = lazy(() => import("@/pages/companies"))
const CompanyDetail = lazy(() => import("@/pages/company_detail"))
const Chat = lazy(() => import("@/pages/chat"))
const Ranking = lazy(() => import("@/pages/ranking"))
const Analytics = lazy(() => import("@/pages/analytics"))
const Settings = lazy(() => import("@/pages/settings"))

function PageLoader() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-[#7966ff]" />
    </div>
  )
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/auth" element={<PublicRoute><Login /></PublicRoute>} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
            <Route path="/graph" element={<Suspense fallback={<PageLoader />}><Graph /></Suspense>} />
            <Route path="/companies" element={<Suspense fallback={<PageLoader />}><Companies /></Suspense>} />
            <Route path="/companies/:id" element={<Suspense fallback={<PageLoader />}><CompanyDetail /></Suspense>} />
            <Route path="/chat" element={<Suspense fallback={<PageLoader />}><Chat /></Suspense>} />
            <Route path="/ranking" element={<Suspense fallback={<PageLoader />}><Ranking /></Suspense>} />
            <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
