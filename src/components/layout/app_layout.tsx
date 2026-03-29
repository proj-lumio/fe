import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { TopBar } from "./top_bar"

export function AppLayout() {
  return (
    <div className="relative flex min-h-screen text-white">
      {/* Blurred background image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg_img.jpeg)" }}
      >
        <div className="absolute inset-0 bg-black/65 backdrop-blur-xl" />
      </div>

      {/* Decorative stripes */}
      <svg
        className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="app-wave-1" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#7966ff" stopOpacity="0" />
            <stop offset="25%" stopColor="#7966ff" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#9d8fff" stopOpacity="0.3" />
            <stop offset="75%" stopColor="#7966ff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7966ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="app-wave-2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22cfff" stopOpacity="0" />
            <stop offset="35%" stopColor="#22cfff" stopOpacity="0.15" />
            <stop offset="65%" stopColor="#7966ff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#7966ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="app-wave-3" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9d8fff" stopOpacity="0" />
            <stop offset="40%" stopColor="#22cfff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#22cfff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="app-wave-4" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#7966ff" stopOpacity="0" />
            <stop offset="30%" stopColor="#7966ff" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#9d8fff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#9d8fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="app-wave-5" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="#22cfff" stopOpacity="0" />
            <stop offset="50%" stopColor="#22cfff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#22cfff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M900 0 C860 180, 780 350, 830 500 S940 650, 880 800 C850 870, 870 890, 860 900" stroke="url(#app-wave-1)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M1200 100 C1160 250, 1100 380, 1140 520 S1220 650, 1180 780" stroke="url(#app-wave-2)" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M400 200 C440 350, 480 450, 420 580 S360 700, 400 830" stroke="url(#app-wave-3)" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M600 0 C640 80, 700 140, 680 220 S620 320, 660 400" stroke="url(#app-wave-4)" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M200 700 C400 660, 700 640, 1000 680 S1300 720, 1440 700" stroke="url(#app-wave-5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M1100 0 C1120 60, 1150 120, 1130 200 S1080 300, 1110 380" stroke="url(#app-wave-2)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>

      <Sidebar />
      <div className="relative z-10 md:ml-[100px] flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-20 sm:px-6 md:px-8 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
