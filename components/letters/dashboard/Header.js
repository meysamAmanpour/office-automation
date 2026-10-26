"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Header({ user, onMenuClick }) {
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    try {
      setLoggingOut(true)

      await fetch("/api/auth/logout", {
        method: "POST",
      })

      router.replace("/login")
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 h-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Notification */}

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition hover:bg-slate-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-700">
                {user?.fullName?.charAt(0) || "U"}
              </div>

              <div className="hidden text-right md:block">
                <div className="text-sm font-bold text-slate-800">
                  {user?.fullName || "کاربر"}
                </div>

                <div className="text-[11px] text-slate-400">
                  {user?.roleRelation?.name || "کاربر"}
                </div>
              </div>

              <span className="hidden text-slate-400 md:block">⌄</span>
            </button>

            {profileOpen && (
              <div className="absolute left-0 top-14 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                <div className="border-b border-slate-100 px-3 py-3">
                  <div className="font-bold text-slate-800">
                    {user?.fullName}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    {user?.username}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50">
                  🚪
                  {loggingOut ? "در حال خروج..." : "خروج از حساب"}
                </button>
              </div>
            )}
          </div>
          <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg transition hover:bg-slate-50">
            🔔
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div>
            <p className="hidden text-xs text-slate-400 sm:block">خوش آمدید</p>

            <p className="font-bold text-slate-800">
              {user?.fullName || "کاربر سیستم"}
            </p>
          </div>
          <button
            onClick={onMenuClick}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden">
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}
