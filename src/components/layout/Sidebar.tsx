import { NavLink, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"
import { useState } from "react"

const NAV_ITEMS = [
  { key: "dashboard" as const, path: "/dashboard", icon: LayoutDashboard },
  { key: "companies" as const, path: "/companies", icon: Building2 },
  { key: "chat" as const, path: "/chat", icon: MessageSquare },
  { key: "ranking" as const, path: "/ranking", icon: Trophy },
  { key: "analytics" as const, path: "/analytics", icon: BarChart3 },
  { key: "settings" as const, path: "/settings", icon: Settings },
]

function LiquidCircle({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full transition-colors"
      style={{
        background: active ? "#7966ff" : "#1f1f1f",
      }}
    >
      {!active && (
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            padding: 1,
            background: "linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.12) 100%)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}
      {children}
    </div>
  )
}

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [pressed, setPressed] = useState(false)

  function handleLogout() {
    logout()
    navigate("/")
  }

  return (
    <>
      {/* Desktop sidebar */}
      <div className="fixed left-0 top-0 z-40 hidden md:flex h-screen w-[100px] flex-col items-center">
        <div className="flex h-24 items-center justify-center pt-5">
          <img src="/lumio_ic.png" alt="Lumio" className="h-14 w-14" />
        </div>

        <nav className="flex flex-1 flex-col items-center justify-center gap-[22px]">
          {NAV_ITEMS.map(({ key, path, icon: Icon }) => (
            <NavLink key={key} to={path} className="transition-all active:scale-[0.95]">
              {({ isActive }) => (
                <LiquidCircle active={isActive}>
                  <Icon className="h-[22px] w-[22px] text-white" />
                </LiquidCircle>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="pb-8">
          <button
            onClick={handleLogout}
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            onPointerLeave={() => setPressed(false)}
            className="transition-all"
            style={{ transform: pressed ? "scale(0.95)" : "scale(1)", transition: "transform 200ms ease-out" }}
          >
            <LiquidCircle active={false}>
              <LogOut className="h-[22px] w-[22px] text-white" />
            </LiquidCircle>
          </button>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div
        className="pointer-events-none fixed bottom-[56px] left-0 right-0 z-39 h-8 md:hidden"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
      />
      <div className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around border-t border-white/[0.06] bg-[#0c0c0c]/90 backdrop-blur-lg px-2 py-2">
        {NAV_ITEMS.map(({ key, path, icon: Icon }) => (
          <NavLink key={key} to={path} className="transition-all active:scale-[0.9]">
            {({ isActive }) => (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                style={{ background: isActive ? "#7966ff" : "#1f1f1f" }}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
            )}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="transition-all active:scale-[0.9]">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "#1f1f1f" }}
          >
            <LogOut className="h-5 w-5 text-[#a9a9a9]" />
          </div>
        </button>
      </div>
    </>
  )
}
