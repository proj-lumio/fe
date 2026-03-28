import { ArrowRight } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()
  const [transitioning, setTransitioning] = useState(false)

  function goToLogin() {
    setTransitioning(true)
    setTimeout(() => navigate("/login"), 700)
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col text-white transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
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

      {/* Header with fade */}
      <header className="fixed top-0 z-50 w-full">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <img src="/lumio_ic.png" alt="Lumio" className="h-9 w-9" />
            <span className="text-lg font-semibold tracking-tight">Lumio</span>
          </div>
          <button
            onClick={goToLogin}
            className="flex items-center gap-2 rounded-lg bg-[#7966ff] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Know your business.
            <br />
            <span className="bg-gradient-to-r from-[#7966ff] to-[#9d8fff] bg-clip-text text-transparent">
              Before it changes.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[#a9a9a9] sm:text-base">
            AI-powered document intelligence. Analyze companies, chat with your
            data, and make decisions grounded in real documents.
          </p>

          <div className="mt-10">
            <button
              onClick={goToLogin}
              className="inline-flex items-center gap-2 rounded-lg bg-[#7966ff] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer — fixed at bottom, not scrollable */}
      <footer className="relative z-10 px-6 pb-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-[#a9a9a9]">
          <span>&copy; 2026 Lumio</span>
          <div className="flex gap-5">
            <a href="#" className="transition-colors hover:text-white">Privacy</a>
            <a href="#" className="transition-colors hover:text-white">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
