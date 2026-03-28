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
    <div
      className="liquid-card flex items-center !rounded-xl text-xs font-medium transition-opacity duration-200"
      style={{ opacity: fading ? 0.5 : 1 }}
    >
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
  )
}
