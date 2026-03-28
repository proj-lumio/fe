import { useEffect } from "react"
import { useThemeStore } from "@/store/theme"

export function useTheme() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (t: "light" | "dark") => {
      root.classList.remove("light", "dark")
      root.classList.add(t)
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      applyTheme(mq.matches ? "dark" : "light")

      const handler = (e: MediaQueryListEvent) =>
        applyTheme(e.matches ? "dark" : "light")
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }

    applyTheme(theme)
  }, [theme])

  return { theme, setTheme }
}
