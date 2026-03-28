import { useLocation } from "react-router-dom"
import { Search, Bell, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/auth"
import { ThemeToggle } from "@/components/ThemeToggle"

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/companies": "Companies",
  "/chat": "Chat",
  "/ranking": "Ranking",
  "/analytics": "Analytics",
  "/meetings": "Meetings",
  "/settings": "Settings",
}

export function TopBar() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  // Determine current page label
  const currentPath = "/" + location.pathname.split("/")[1]
  const currentLabel = routeLabels[currentPath] ?? "Dashboard"

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      {/* Left: pill tabs */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground"
          )}
        >
          {currentLabel}
        </span>
      </div>

      {/* Right: search, theme, user, bell, logout */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="Search" className="rounded-full">
          <Search className="h-4 w-4" />
        </Button>

        <ThemeToggle />

        <Button variant="ghost" size="icon" title="Notifications" className="rounded-full">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User avatar + name */}
        <div className="flex items-center gap-2 pl-2">
          <Avatar className="h-8 w-8">
            {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName ?? "User"} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          {user?.displayName && (
            <span className="hidden text-sm font-medium text-foreground md:inline">
              {user.displayName}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          title="Logout"
          className="rounded-full"
          onClick={() => {
            useAuthStore.getState().setUser(null)
            window.location.href = "/login"
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
