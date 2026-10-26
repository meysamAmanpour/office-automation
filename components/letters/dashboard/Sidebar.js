"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const menuGroups = [
  {
    title: "اصلی",
    items: [
      {
        title: "داشبورد",
        href: "/dashboard",
        icon: "▦",
        permission: null,
      },
    ],
  },
  {
    title: "اتوماسیون",
    items: [
      {
        title: "نامه‌های دریافتی",
        href: "/dashboard/letters/incoming",
        icon: "📥",
        permission: "letters.view",
      },
      {
        title: "نامه‌های ارسالی",
        href: "/dashboard/letters/outbox",
        icon: "📤",
        permission: "letters.view",
      },
      {
        title: "پیش‌نویس‌ها",
        href: "/dashboard/letters/drafts",
        icon: "📝",
        permission: "letters.view",
      },
    ],
  },
  {
    title: "مدیریت",
    items: [
      {
        title: "کاربران",
        href: "/dashboard/users",
        icon: "👥",
        permission: "users.view",
      },
      {
        title: "شرکت‌ها",
        href: "/dashboard/companies",
        icon: "🏢",
        permission: "companies.view",
      },
      {
        title: "دپارتمان‌ها",
        href: "/dashboard/departments",
        icon: "🏛️",
        permission: "departments.view",
      },
    ],
  },
  {
    title: "گزارش‌ها",
    items: [
      {
        title: "گزارش نامه‌ها",
        href: "/dashboard/reports/letters",
        icon: "📊",
        permission: "reports.view",
      },
      {
        title: "گزارش فعالیت‌ها",
        href: "/dashboard/reports/audit",
        icon: "📋",
        permission: "audit.view",
      },
    ],
  },
]

export default function Sidebar({ user, open, onClose }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const permissions = user?.permissions || []

  function hasPermission(permission) {
    if (!permission) return true

    return permissions.includes(permission)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen flex-col border-l border-slate-200 bg-white shadow-xl transition-all duration-300 ${collapsed ? "w-20" : "w-72"} ${open ? "translate-x-0" : "translate-x-full"} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
                A
              </div>

              <div>
                <div className="font-bold text-slate-900">اتوماسیون اداری</div>

                <div className="text-[11px] text-slate-400">مدیریت سازمان</div>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              A
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:block">
            {collapsed ? "←" : "→"}
          </button>
        </div>

        {/* User */}
        {!collapsed && (
          <div className="mx-4 mt-5 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {user?.fullName?.charAt(0) || "U"}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-800">
                  {user?.fullName || "کاربر"}
                </div>

                <div className="mt-1 truncate text-xs text-slate-400">
                  {user?.roleRelation?.name || "کاربر سیستم"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-5">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              hasPermission(item.permission),
            )

            if (!visibleItems.length) return null

            return (
              <div key={group.title} className="mb-6">
                {!collapsed && (
                  <div className="mb-2 px-3 text-[11px] font-bold text-slate-400">
                    {group.title}
                  </div>
                )}

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        title={collapsed ? item.title : undefined}
                        className={`
                          group
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-3
                          text-sm
                          font-medium
                          transition-all

                          ${
                            active
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }

                          ${collapsed ? "justify-center" : ""}
                        `}>
                        <span
                          className={`
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-base

                            ${
                              active
                                ? "bg-white/15"
                                : "bg-slate-50 group-hover:bg-white"
                            }
                          `}>
                          {item.icon}
                        </span>

                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-slate-100 p-4">
            <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
              سیستم آماده به کار است
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
