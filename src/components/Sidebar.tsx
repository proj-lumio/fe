import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Trophy,
  BarChart3,
  Video,
  Settings,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/companies", icon: Building2, label: "Companies" },
  { to: "/chat", icon: MessageSquare, label: "Chat" },
  { to: "/ranking", icon: Trophy, label: "Ranking" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/meetings", icon: Video, label: "Meetings" },
  { to: "/settings", icon: Settings, label: "Settings" },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-16 flex-col items-center border-r border-sidebar-border bg-sidebar-background py-4">
      {/* Logo */}
      <div className="mb-6">
        <img src="/lumio_ic.png" alt="Lumio" className="h-10 w-10" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
          </NavLink>
        ))}
      </nav>

      {/* Plus button at bottom */}
      <button
        title="Add new"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      >
        <Plus className="h-5 w-5" />
      </button>
    </aside>
  )
}
