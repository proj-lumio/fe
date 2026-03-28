import { useAuthStore } from "@/store/auth"

export function TopBar() {
  const user = useAuthStore((s) => s.user)

  const initials = user?.display_name
    ? user.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "?"

  return (
    <header className="flex h-20 items-center justify-between px-8">
      {/* Left empty */}
      <div />

      {/* Right — email + avatar */}
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-[#a9a9a9]">{user?.email}</span>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7966ff]/20 text-[13px] font-bold text-[#7966ff]">
          {initials}
        </div>
      </div>
    </header>
  )
}
