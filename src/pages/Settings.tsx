import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Loader2,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsApi } from "@/lib/api"
import type { UserSettings } from "@/types"

export default function Settings() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserSettings>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
  })

  const theme = settings?.theme ?? "system"
  const language = settings?.language ?? "en"
  const notificationsEnabled = settings?.notifications_enabled ?? true

  function updateSetting(data: Partial<UserSettings>) {
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences.</p>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      {/* Theme */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Select your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Monitor },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => updateSetting({ theme: option.id })}
                disabled={updateMutation.isPending}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 transition-colors",
                  theme === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <option.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{option.label}</span>
                {theme === option.id && (
                  <Check className="ml-auto h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={language}
            onChange={(e) => updateSetting({ language: e.target.value })}
            disabled={updateMutation.isPending}
            className="flex h-9 w-full max-w-xs rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="pt">Portuguese</option>
            <option value="ja">Japanese</option>
            <option value="zh">Chinese</option>
          </select>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <Label className="text-sm font-medium">Enable Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications about document processing, ranking changes, and more.
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={(checked) =>
                updateSetting({ notifications_enabled: checked })
              }
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save indicator */}
      {updateMutation.isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </div>
      )}
      {updateMutation.isSuccess && (
        <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
          <Check className="h-4 w-4" />
          Settings saved
        </div>
      )}
    </div>
  )
}
