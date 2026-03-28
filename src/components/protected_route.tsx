import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { Loader2 } from "lucide-react"

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0c0c0c]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7966ff]" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  return <Outlet />
}
