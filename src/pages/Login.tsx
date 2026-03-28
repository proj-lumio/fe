import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth"
import { Mail, Lock, Loader2 } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entered, setEntered] = useState(false)

  // Entrance animation
  useEffect(() => {
    requestAnimationFrame(() => setEntered(true))
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError("Please enter email and password")
      return
    }
    setLoading(true)
    setError(null)
    setTimeout(() => {
      setUser({
        uid: "user-1",
        email,
        displayName: email.split("@")[0],
        photoURL: null,
      })
      setLoading(false)
      navigate("/dashboard")
    }, 600)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Same blurred bg as landing */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg_img.webp)" }}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />
      </div>

      {/* Login card with entrance animation */}
      <div
        className={`relative z-10 w-full max-w-sm transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          entered
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-95 opacity-0"
        }`}
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <img src="/lumio_ic.png" alt="Lumio" className="h-12 w-12" />
          <h1 className="text-2xl font-bold text-white">Lumio</h1>
          <p className="text-sm text-[#a9a9a9]">
            Enterprise document intelligence
          </p>
        </div>

        {/* Liquid card login form */}
        <div className="liquid-card p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-white">Welcome back</h2>
            <p className="mt-1 text-xs text-[#a9a9a9]">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a9a9a9]" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 pl-9 text-sm text-white shadow-sm transition-colors placeholder:text-[#666] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7966ff]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a9a9a9]" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 pl-9 text-sm text-white shadow-sm transition-colors placeholder:text-[#666] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7966ff]"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
