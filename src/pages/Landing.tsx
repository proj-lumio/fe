import { ArrowRight } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LanguageSwitch } from "@/components/LanguageSwitch"
import { LiquidInput } from "@/components/LiquidInput"
import { OpenSourceBanner } from "@/components/OpenSourceBanner"
import { useTranslations } from "@/hooks/useTranslations"
import { validateEmail } from "@/lib/validators"

export default function Landing() {
  const navigate = useNavigate()
  const t = useTranslations()
  const [transitioning, setTransitioning] = useState(false)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")

  function goToLogin() {
    setTransitioning(true)
    setTimeout(() => navigate("/login", { state: { email } }), 700)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = validateEmail(email, { email_invalid: t.landing.email_invalid })
    if (!result.valid) {
      setEmailError(result.error)
      return
    }
    setEmailError("")
    goToLogin()
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col overflow-hidden text-white transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        transitioning ? "scale-95 opacity-0 blur-md" : "scale-100 opacity-100 blur-0"
      }`}
    >
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg_img.webp)" }}
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
          <img
            src="/lumio_banner.png"
            alt="Lumio"
            className="h-16 w-auto sm:h-22 lg:h-28"
          />
          <LanguageSwitch />
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-24 sm:px-6 sm:pt-0">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {t.landing.title_1}
            <br />
            <span className="bg-gradient-to-r from-[#7966ff] to-[#9d8fff] bg-clip-text text-transparent">
              {t.landing.title_2}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-xs leading-relaxed text-[#a9a9a9] sm:mt-6 sm:text-sm lg:text-base">
            {t.landing.subtitle}
          </p>

          {/* Email field (liquid) + CTA */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col items-stretch gap-3 sm:mt-10 sm:flex-row"
          >
            <div className="w-full sm:flex-1 sm:min-w-0">
              <LiquidInput
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError("") }}
                placeholder={t.landing.email_placeholder}
              />
              {emailError && (
                <p className="mt-1.5 text-left text-[11px] text-red-400">{emailError}</p>
              )}
            </div>
            <button
              type="submit"
              style={{ borderRadius: 12 }}
              className="flex h-12 shrink-0 items-center justify-center gap-2 bg-[#7966ff] px-6 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:brightness-110 sm:px-8"
            >
              {t.landing.cta}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Arc */}
      <div className="relative z-10">
        <svg
          viewBox="0 0 1440 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full"
          preserveAspectRatio="none"
          style={{ height: 180 }}
        >
          <defs>
            <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7966ff" stopOpacity="0" />
              <stop offset="15%" stopColor="#7966ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#9d8fff" stopOpacity="1" />
              <stop offset="85%" stopColor="#7966ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7966ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="arc-fill" x1="0.5" y1="0.3" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#7966ff" stopOpacity="0.08" />
              <stop offset="40%" stopColor="#7966ff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#0c0c0c" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 160 Q720 10 1440 160 L1440 300 L0 300 Z"
            fill="url(#arc-fill)"
          />
          <path
            d="M0 160 Q720 10 1440 160"
            stroke="url(#arc-grad)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        <div style={{ marginTop: -60 }}>
          <OpenSourceBanner />
        </div>
      </div>

      {/* Bottom padding */}
      <div className="relative z-10 h-8 sm:h-10" />
    </div>
  )
}
