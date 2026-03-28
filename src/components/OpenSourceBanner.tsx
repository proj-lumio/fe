import { ArrowRight } from "lucide-react"
import { useTranslations } from "@/hooks/useTranslations"

export function OpenSourceBanner() {
  const t = useTranslations()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:items-center sm:gap-8 sm:px-6">
      {/* Icon — bouncing hover, not clickable */}
      <img
        src="/lumio_ic.png"
        alt="Lumio"
        className="hidden h-20 w-20 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 sm:block"
      />

      {/* Card */}
      <div className="liquid-card-strong flex w-full flex-1 flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="text-sm font-bold sm:text-base">
            {t.landing.open_source_title}
          </h3>
          <p className="text-[11px] leading-relaxed text-[#a9a9a9] sm:text-xs">
            {t.landing.open_source_body}
          </p>
        </div>

        <a
          href="https://github.com/proj-lumio"
          target="_blank"
          rel="noopener noreferrer"
          className="liquid-card-btn flex h-10 shrink-0 items-center justify-center gap-2 px-5 text-xs font-medium text-[#a9a9a9] transition-all duration-200 active:scale-[0.98] hover:text-white sm:px-6"
        >
          {t.landing.learn_more}
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
