import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { LanguageSwitch } from "@/components/language_switch"
import { LiquidInput } from "@ui"
import { OpenSourceBanner } from "@/components/open_source_banner"
import { useTranslations } from "@/hooks/useTranslations"
import { validateEmail, validatePassword } from "@/lib/validators"
import { ArrowRight, Loader2 } from "lucide-react"
import type { AxiosError } from "axios"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const t = useTranslations()
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)

  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmError, setConfirmError] = useState("")
  const [formError, setFormError] = useState("")
  const [entered, setEntered] = useState(false)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    const state = location.state as { email?: string } | null
    if (state?.email) setEmail(state.email)
  }, [location.state])

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true))
  }, [])

  function switchMode() {
    setSwitching(true)
    setTimeout(() => {
      setMode((m) => (m === "login" ? "register" : "login"))
      setPassword("")
      setConfirmPassword("")
      setEmailError("")
      setPasswordError("")
      setConfirmError("")
      setFormError("")
      setTimeout(() => setSwitching(false), 50)
    }, 200)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let hasError = false

    const emailResult = validateEmail(email, { email_invalid: t.login.email_invalid })
    if (!emailResult.valid) { setEmailError(emailResult.error); hasError = true } else { setEmailError("") }

    const pwResult = validatePassword(password, {
      password_min: t.login.password_min,
      password_number: t.login.password_number,
      password_special: t.login.password_special,
    })
    if (!pwResult.valid) { setPasswordError(pwResult.error); hasError = true } else { setPasswordError("") }

    if (mode === "register") {
      if (password !== confirmPassword) {
        setConfirmError(t.login.password_mismatch)
        hasError = true
      } else {
        setConfirmError("")
      }
    }

    if (hasError) return

    setLoading(true)
    setFormError("")
    ;(async () => {
      try {
        if (mode === "login") {
          await login(email, password)
        } else {
          await register(email, password, email.split("@")[0])
        }
        navigate("/dashboard")
      } catch (err) {
        const axiosErr = err as AxiosError<{ detail?: string }>
        const detail = axiosErr.response?.data?.detail
        setFormError(detail ?? (mode === "login" ? t.login.login_failed : t.login.register_failed))
      } finally {
        setLoading(false)
      }
    })()
  }

  const isLogin = mode === "login"

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-white">
      {/* Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg_img.jpeg)" }}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />
      </div>

      {/* Side fades */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 15%, rgba(0,0,0,0.35) 30%, transparent 45%, transparent 55%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      {/* Vertical wavy stripe — left of center */}
      <svg
        className="pointer-events-none fixed inset-0 z-[2] h-full w-full"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-v" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#7966ff" stopOpacity="0" />
            <stop offset="20%" stopColor="#7966ff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#9d8fff" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#7966ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7966ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave-diag" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9d8fff" stopOpacity="0" />
            <stop offset="30%" stopColor="#9d8fff" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#7966ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7966ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Vertical line — left */}
        <path
          d="M520 0 C480 160, 400 300, 450 440 S560 580, 500 720"
          stroke="url(#wave-v)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Small diagonal — starts bottom right, curls toward right edge */}
        <path
          d="M1100 680 C1140 710, 1180 730, 1250 740 S1360 760, 1440 790"
          stroke="url(#wave-diag)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Header */}
      <header className="fixed top-0 z-50 w-full">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          }}
        />
        <div className="relative flex h-20 items-center justify-between px-6 sm:h-24 sm:px-8 lg:px-10">
          <img src="/lumio_banner.png" alt="Lumio" className="h-20 w-auto sm:h-28 lg:h-36" />
          <LanguageSwitch />
        </div>
      </header>

      {/* Form */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-24 sm:px-6 sm:pt-0">
        <div
          className={`w-full max-w-sm transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"
          }`}
        >
          {/* Subtitle above form */}
          <div className="mb-6 text-center">
            <p className="text-base font-medium text-white sm:text-lg">
              {isLogin ? t.login.subtitle : t.login.register_subtitle}
            </p>
          </div>

          {/* Liquid card — animated switch */}
          <div
            className={`liquid-card-strong px-6 py-5 transition-all duration-300 sm:px-8 ${
              switching ? "scale-[0.97] opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <div className="mb-5 text-center">
              <h2 className="text-xl font-semibold sm:text-2xl">
                {isLogin ? t.login.title : t.login.register_title}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="email" className="text-[11px] font-medium text-[#a9a9a9]">
                  {t.login.email}
                </label>
                <LiquidInput
                  id="email"
                  type="email"
                  placeholder={t.login.email_placeholder}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError("") }}
                />
                {emailError && <p className="text-[11px] text-red-400">{emailError}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-[11px] font-medium text-[#a9a9a9]">
                  {t.login.password}
                </label>
                <LiquidInput
                  key="pw"
                  id="password"
                  type="password"
                  placeholder={t.login.password_placeholder}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError("") }}
                />
                {passwordError && <p className="text-[11px] text-red-400">{passwordError}</p>}
              </div>

              {/* Confirm password — register only, animated */}
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: isLogin ? 0 : 80,
                  opacity: isLogin ? 0 : 1,
                }}
              >
                <div className="space-y-1 pt-0.5">
                  <label htmlFor="confirm" className="text-[11px] font-medium text-[#a9a9a9]">
                    {t.login.confirm_password}
                  </label>
                  <LiquidInput
                    key="confirm-pw"
                    id="confirm"
                    type="password"
                    placeholder={t.login.confirm_password_placeholder}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError("") }}
                  />
                  {confirmError && <p className="text-[11px] text-red-400">{confirmError}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ borderRadius: 12 }}
                className="flex h-11 w-full items-center justify-center gap-2 bg-[#7966ff] text-sm font-semibold text-white transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLogin ? t.login.submit : t.login.register}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              {formError && (
                <p className="mt-2 text-center text-[11px] text-red-400">{formError}</p>
              )}
            </form>

            {/* Switch mode */}
            <div className="mt-4 text-center">
              <button
                onClick={switchMode}
                className="text-xs text-[#a9a9a9] transition-colors hover:text-white"
              >
                {isLogin ? t.login.switch_to_register : t.login.switch_to_login}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Arc — same as landing */}
      <div className="relative z-10">
        <svg
          viewBox="0 0 1440 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full"
          preserveAspectRatio="none"
          style={{ height: 160 }}
        >
          <defs>
            <linearGradient id="arc-grad-login" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7966ff" stopOpacity="0" />
              <stop offset="15%" stopColor="#7966ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#9d8fff" stopOpacity="1" />
              <stop offset="85%" stopColor="#7966ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7966ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="arc-fill-login" x1="0.5" y1="0.3" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#7966ff" stopOpacity="0.08" />
              <stop offset="40%" stopColor="#7966ff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#0c0c0c" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 160 Q720 10 1440 160 L1440 300 L0 300 Z" fill="url(#arc-fill-login)" />
          <path d="M0 160 Q720 10 1440 160" stroke="url(#arc-grad-login)" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>

        <div style={{ marginTop: -50 }}>
          <OpenSourceBanner />
        </div>
      </div>

      {/* Bottom padding */}
      <div className="relative z-10 h-8 sm:h-10" />
    </div>
  )
}
