"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

const statusOptions = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: "PENDING", label: "دریافت نشده" },
  { value: "RECEIVED", label: "دریافت شده" },
  { value: "READ", label: "خوانده شده" },
  { value: "ARCHIVED", label: "بایگانی شده" },
]

const priorityOptions = [
  { value: "", label: "همه اولویت‌ها" },
  { value: "LOW", label: "کم" },
  { value: "NORMAL", label: "عادی" },
  { value: "HIGH", label: "مهم" },
  { value: "URGENT", label: "فوری" },
]

const statusConfig = {
  PENDING: {
    label: "دریافت نشده",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  RECEIVED: {
    label: "دریافت شده",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  READ: {
    label: "خوانده شده",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  ARCHIVED: {
    label: "بایگانی شده",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-500",
  },
}

const priorityConfig = {
  LOW: {
    label: "کم",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
  NORMAL: {
    label: "عادی",
    className: "bg-blue-50 text-blue-600 border-blue-200",
  },
  HIGH: {
    label: "مهم",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  URGENT: {
    label: "فوری",
    className: "bg-red-50 text-red-700 border-red-200",
  },
}

function formatDate(date) {
  if (!date) return "-"

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date))
}

function getRecipientTypeLabel(type) {
  const map = {
    USER: "کاربر",
    DEPARTMENT: "دپارتمان",
    COMPANY: "شرکت",
  }

  return map[type] || type || "-"
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status || "نامشخص",
    className: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || {
    label: priority || "نامشخص",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export default function IncomingLettersPage() {
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")

  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })

  async function fetchLetters() {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      })

      if (search.trim()) {
        params.set("search", search.trim())
      }

      if (status) {
        params.set("status", status)
      }

      if (priority) {
        params.set("priority", priority)
      }

      const response = await fetch(
        `/api/letters/incoming?${params.toString()}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "خطا در دریافت نامه‌ها")
      }

      setLetters(result.data || [])

      setMeta(
        result.meta || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 1,
        },
      )
    } catch (err) {
      setError(err.message || "خطا در دریافت نامه‌ها")
      setLetters([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLetters()
  }, [page, status, priority])

  const unreadCount = useMemo(() => {
    return letters.filter((letter) => letter.recipient?.status === "PENDING")
      .length
  }, [letters])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setPage(1)
    fetchLetters()
  }

  function clearFilters() {
    setSearch("")
    setStatus("")
    setPriority("")
    setPage(1)
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/dashboard" className="transition hover:text-slate-900">
              داشبورد
            </Link>

            <span>/</span>

            <span className="text-slate-700">نامه‌های دریافتی</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 8.5 12 14l9-5.5M4.5 6.5h15A1.5 1.5 0 0 1 21 8v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V8a1.5 1.5 0 0 1 1.5-1.5Z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                نامه‌های دریافتی
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                مدیریت و پیگیری نامه‌های دریافت‌شده
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="text-xs text-amber-600">دریافت نشده</div>

            <div className="mt-1 text-xl font-bold text-amber-700">
              {unreadCount}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs text-slate-500">مجموع نامه‌ها</div>

            <div className="mt-1 text-xl font-bold text-slate-800">
              {meta.total}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              جستجو
            </label>

            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="موضوع یا شماره نامه..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              <svg
                className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                />
              </svg>
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              وضعیت
            </label>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white">
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              اولویت
            </label>

            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white">
              {priorityOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2 lg:col-span-3">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
              جستجو
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              پاک کردن
            </button>
          </div>
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-100" />

                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/3 rounded bg-slate-100" />
                  <div className="h-3 w-2/3 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h3 className="font-semibold text-red-800">
            دریافت اطلاعات با خطا مواجه شد
          </h3>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            onClick={fetchLetters}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700">
            تلاش مجدد
          </button>
        </div>
      ) : letters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M4 7h16v12H4zM4 7l86 8-6"
              />
            </svg>
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            نامه‌ای پیدا نشد
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            با تغییر فیلترها یا عبارت جستجو دوباره تلاش کنید.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {letters.map((letter) => {
            const recipientStatus = letter.recipient?.status

            return (
              <Link
                key={letter.id}
                href={`/dashboard/letters/incoming/${letter.id}`}
                className={`group block rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${
                  recipientStatus === "PENDING"
                    ? "border-amber-200"
                    : "border-slate-200"
                }`}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      recipientStatus === "PENDING"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                    }`}>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M4 6.5h16v11H4zM4 7l8 6 8-6"
                      />
                    </svg>
                  </div>

                  {/* Main */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-bold text-slate-900 group-hover:text-blue-700">
                        {letter.subject || "بدون موضوع"}
                      </h2>

                      <StatusBadge status={recipientStatus} />

                      <PriorityBadge priority={letter.priority} />
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-500 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <span className="text-slate-400">فرستنده:</span>{" "}
                        <span className="font-medium text-slate-700">
                          {letter.sender?.fullName || "-"}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400">دپارتمان:</span>{" "}
                        <span className="font-medium text-slate-700">
                          {letter.department?.name || "-"}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400">نوع گیرنده:</span>{" "}
                        <span className="font-medium text-slate-700">
                          {getRecipientTypeLabel(letter.recipient?.type)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400">تاریخ:</span>{" "}
                        <span className="font-medium text-slate-700">
                          {formatDate(letter.createdAt)}
                        </span>
                      </div>
                    </div>

                    {letter.body && (
                      <p className="mt-3 line-clamp-1 text-sm text-slate-400">
                        {letter.body}
                      </p>
                    )}
                  </div>

                  {/* Number / Arrow */}
                  <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 lg:w-44 lg:flex-col lg:items-end lg:border-t-0 lg:border-r lg:pt-0 lg:pr-5">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">شماره نامه</div>

                      <div className="mt-1 text-sm font-semibold text-slate-700">
                        {letter.letterNumber || "بدون شماره"}
                      </div>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="m9 5 7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && meta.pages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="text-sm text-slate-500">
            صفحه{" "}
            <span className="font-semibold text-slate-700">{meta.page}</span> از{" "}
            <span className="font-semibold text-slate-700">{meta.pages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              قبلی
            </button>

            <button
              disabled={page >= meta.pages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
