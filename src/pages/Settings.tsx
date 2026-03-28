import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Globe, Bell } from "lucide-react"
import { settingsApi } from "@/lib/api"
import { useTranslations } from "@/hooks/useTranslations"
import { LanguageSwitch } from "@/components/language_switch"
import type { SettingsUpdate } from "@/types"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.06] ${className}`} />
}

export default function Settings() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [showSaved, setShowSaved] = useState(false)

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: SettingsUpdate) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
      setShowSaved(true)
    },
  })

  useEffect(() => {
    if (!showSaved) return
    const timer = setTimeout(() => setShowSaved(false), 2000)
    return () => clearTimeout(timer)
  }, [showSaved])

  if (isLoading) {
    return (
      <div className="space-y-6 pt-2 max-w-2xl">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32" />
        <Skeleton className="h-40" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#a9a9a9]">{t.common.error}</p>
      </div>
    )
  }

  const notificationsEnabled = settings?.notifications_enabled ?? false

  return (
    <div className="space-y-6 pt-2 max-w-2xl">
      <div style={{ animation: "fadeInUp 500ms both" }}>
        <h1 className="text-xl font-bold uppercase text-white">{t.settings.title}</h1>
        <p className="text-[#a9a9a9] text-sm mt-1">{t.settings.subtitle}</p>
      </div>

      {showSaved && (
        <p className="text-sm text-green-400" style={{ animation: "fadeInUp 300ms both" }}>
          {t.settings.saved}
        </p>
      )}

      {/* Language */}
      <div className="liquid-card p-5 sm:p-6 space-y-4" style={{ animation: "fadeInUp 500ms 150ms both" }}>
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-white" />
          <div>
            <h2 className="text-white font-bold">{t.settings.language}</h2>
            <p className="text-sm text-[#a9a9a9]">{t.settings.language_desc}</p>
          </div>
        </div>
        <div className="pl-8">
          <LanguageSwitch />
        </div>
      </div>

      {/* Notifications */}
      <div className="liquid-card p-5 sm:p-6 space-y-4" style={{ animation: "fadeInUp 500ms 300ms both" }}>
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-white" />
          <div>
            <h2 className="text-white font-bold">{t.settings.notifications}</h2>
            <p className="text-sm text-[#a9a9a9]">{t.settings.notifications_desc}</p>
          </div>
        </div>

        <div className="pl-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-white text-sm">{t.settings.notifications_enable}</p>
            <p className="text-xs text-[#a9a9a9] mt-1">{t.settings.notifications_detail}</p>
          </div>

          <button
            onClick={() => updateMutation.mutate({ notifications_enabled: !notificationsEnabled })}
            disabled={updateMutation.isPending}
            className="relative flex-shrink-0 w-12 h-7 rounded-full transition-colors duration-200 active:scale-[0.98]"
            style={{
              backgroundColor: notificationsEnabled ? "#7966ff" : "rgba(255,255,255,0.1)",
              borderRadius: 14,
            }}
          >
            <span
              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
              style={{
                left: 4,
                transform: notificationsEnabled ? "translateX(20px)" : "translateX(0)",
              }}
            />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
