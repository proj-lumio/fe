import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { CustomCursor } from "@/components/CustomCursor"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AppLayout } from "@/components/layout/AppLayout"
import { useAuthStore } from "@/store/auth"
import { Loader2 } from "lucide-react"
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"

const Dashboard = lazy(() => import("@/pages/Dashboard"))
const Companies = lazy(() => import("@/pages/Companies"))
const CompanyDetail = lazy(() => import("@/pages/CompanyDetail"))
const Chat = lazy(() => import("@/pages/Chat"))
const Ranking = lazy(() => import("@/pages/Ranking"))
const Analytics = lazy(() => import("@/pages/Analytics"))
const Settings = lazy(() => import("@/pages/Settings"))

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
