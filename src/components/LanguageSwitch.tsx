import { useState } from "react"
import { useLocaleStore } from "@/store/locale"
import type { Locale } from "@/lib/i18n"

export function LanguageSwitch() {
  const { locale, setLocale } = useLocaleStore()
  const [fading, setFading] = useState(false)

  function switchTo(lang: Locale) {
    if (lang === locale) return
    setFading(true)
    setTimeout(() => {
      setLocale(lang)
      setTimeout(() => setFading(false), 50)
    }, 200)
  }

  return (
    <>
      {/* Fade overlay on language switch */}
      <div
        className="pointer-events-none fixed inset-0 z-[9999] bg-black transition-opacity duration-300"
        style={{ opacity: fading ? 0.4 : 0 }}
      />

      <div className="liquid-card flex items-center !rounded-xl text-xs font-medium">
        <button
          onClick={() => switchTo("it")}
          className={`px-3.5 py-2 transition-all duration-200 ${
            locale === "it"
              ? "text-white"
              : "text-[#555] hover:text-[#a9a9a9]"
          }`}
        >
          IT
        </button>
        <div className="h-4 w-px bg-white/10" />
        <button
          onClick={() => switchTo("en")}
          className={`px-3.5 py-2 transition-all duration-200 ${
            locale === "en"
              ? "text-white"
              : "text-[#555] hover:text-[#a9a9a9]"
          }`}
        >
          EN
        </button>
      </div>
    </>
  )
}
