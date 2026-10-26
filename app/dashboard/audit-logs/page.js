"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [action, setAction] = useState("")
  const [entity, setEntity] = useState("")

  const [page, setPage] = useState(1)

  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })

  async function fetchLogs() {
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()

      params.set("page", page)
      params.set("limit", "10")

      if (search.trim()) {
        params.set("search", search.trim())
      }

      if (action) {
        params.set("action", action)
      }

      if (entity) {
        params.set("entity", entity)
      }

      const response = await fetch(`/api/audit-logs?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "خطا در دریافت گزارش فعالیت‌ها")
      }

      setLogs(result.data || [])

      setMeta(
        result.meta || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 1,
        },
      )
    } catch (err) {
      setError(err.message || "خطا در دریافت اطلاعات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, action, entity])

  function handleSearch(event) {
    event.preventDefault()

    setPage(1)
    fetchLogs()
  }

  function clearFilters() {
    setSearch("")
    setAction("")
    setEntity("")
    setPage(1)
  }

  function getActionLabel(value) {
    const actions = {
      REFERRAL_CREATED: "ایجاد ارجاع",
      REFERRAL_RECEIVED: "دریافت ارجاع",
      REFERRAL_STARTED: "شروع ارجاع",
      REFERRAL_COMPLETED: "تکمیل ارجاع",
      REFERRAL_REJECTED: "رد ارجاع",
      REFERRAL_CANCELLED: "لغو ارجاع",
    }

    return actions[value] || value || "—"
  }

  function getEntityLabel(value) {
    const entities = {
      LETTER: "نامه",
      LETTER_REFERRAL: "ارجاع نامه",
      USER: "کاربر",
      DEPARTMENT: "واحد",
      COMPANY: "شرکت",
    }

    return entities[value] || value || "—"
  }

  function getActionStyle(value) {
    if (value === "REFERRAL_CREATED") {
      return "bg-blue-50 text-blue-700 border-blue-200"
    }

    if (value === "REFERRAL_RECEIVED") {
      return "bg-cyan-50 text-cyan-700 border-cyan-200"
    }

    if (value === "REFERRAL_STARTED") {
      return "bg-violet-50 text-violet-700 border-violet-200"
    }

    if (value === "REFERRAL_COMPLETED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    }

    if (value === "REFERRAL_REJECTED") {
      return "bg-red-50 text-red-700 border-red-200"
    }

    if (value === "REFERRAL_CANCELLED") {
      return "bg-amber-50 text-amber-700 border-amber-200"
    }

    return "bg-slate-50 text-slate-600 border-slate-200"
  }

  return (
    <div className="min-h-full" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-xl text-white shadow-lg shadow-violet-600/20">
            📋
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">
              گزارش فعالیت‌ها
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              مشاهده و پیگیری فعالیت‌های انجام‌شده در سامانه
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              مجموع فعالیت‌ها
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg">
              📊
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900">{meta.total}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              فعالیت‌های این صفحه
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
              📝
            </span>
          </div>

          <div className="text-2xl font-black text-blue-600">{logs.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              صفحه جاری
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
              📄
            </span>
          </div>

          <div className="text-2xl font-black text-emerald-600">
            {meta.page} / {meta.pages}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <label className="mb-2 block text-xs font-bold text-slate-500">
              جستجو
            </label>

            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجو در عملیات، موجودیت یا توضیحات..."
                className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              py-3
              pr-11
              pl-4
              text-sm
              outline-none
              transition
              focus:border-violet-500
              focus:bg-white
              focus:ring-4
              focus:ring-violet-500/10
            "
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="mb-2 block text-xs font-bold text-slate-500">
              عملیات
            </label>

            <select
              value={action}
              onChange={(event) => {
                setAction(event.target.value)
                setPage(1)
              }}
              className="
            w-full
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-4
            py-3
            text-sm
            outline-none
            focus:border-violet-500
            focus:ring-4
            focus:ring-violet-500/10
          ">
              <option value="">همه عملیات‌ها</option>
              <option value="REFERRAL_CREATED">ایجاد ارجاع</option>
              <option value="REFERRAL_RECEIVED">دریافت ارجاع</option>
              <option value="REFERRAL_STARTED">شروع ارجاع</option>
              <option value="REFERRAL_COMPLETED">تکمیل ارجاع</option>
              <option value="REFERRAL_REJECTED">رد ارجاع</option>
              <option value="REFERRAL_CANCELLED">لغو ارجاع</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-2 block text-xs font-bold text-slate-500">
              موجودیت
            </label>

            <select
              value={entity}
              onChange={(event) => {
                setEntity(event.target.value)
                setPage(1)
              }}
              className="
            w-full
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-4
            py-3
            text-sm
            outline-none
            focus:border-violet-500
            focus:ring-4
            focus:ring-violet-500/10
          ">
              <option value="">همه موجودیت‌ها</option>
              <option value="LETTER">نامه</option>
              <option value="LETTER_REFERRAL">ارجاع نامه</option>
              <option value="USER">کاربر</option>
              <option value="DEPARTMENT">واحد</option>
              <option value="COMPANY">شرکت</option>
            </select>
          </div>

          <div className="flex items-end gap-2 lg:col-span-2">
            <button
              type="submit"
              className="
            flex-1 rounded-xl
            bg-slate-900
            px-4
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-slate-800
          ">
              جستجو
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-sm
            font-bold
            text-slate-600
            transition
            hover:bg-slate-50
          ">
              پاک
            </button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-black text-slate-900">لیست فعالیت‌ها</h2>

            <p className="mt-1 text-xs text-slate-400">
              {meta.total} فعالیت در سیستم
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 p-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl">
              📭
            </div>

            <h3 className="font-bold text-slate-800">گزارشی پیدا نشد</h3>

            <p className="mt-2 text-sm text-slate-400">
              با تغییر فیلترها یا عبارت جستجو دوباره امتحان کنید.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <Link
                key={log.id}
                href={`/dashboard/audit-logs/${log.id}`}
                className="
      block
      p-5
      transition
      hover:bg-slate-50
    ">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`
              rounded-full
              border
              px-2.5
              py-1
              text-[11px]
              font-bold
              ${getActionStyle(log.action)}
            `}>
                        {getActionLabel(log.action)}
                      </span>{" "}
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                        {getEntityLabel(log.entity)}
                      </span>
                    </div>

                    <h3 className="mb-2 font-bold text-slate-900">
                      {log.description || "بدون توضیحات"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                      <span>کاربر: {log.user?.fullName || "سیستم"}</span>

                      <span>نام کاربری: {log.user?.username || "—"}</span>

                      <span>شناسه: {log.entityId || "—"}</span>

                      <span>
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString("fa-IR")
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="rounded-xl bg-slate-50 px-4 py-2 text-center">
                      <div className="text-[10px] text-slate-400">
                        مشاهده جزئیات
                      </div>

                      <div className="mt-1 text-lg text-violet-600">←</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && meta.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
              className="
            rounded-xl
            border
            border-slate-200
            px-4
            py-2
            text-sm
            font-bold
            text-slate-600
            disabled:cursor-not-allowed
            disabled:opacity-40
          ">
              قبلی
            </button>

            <span className="text-sm font-bold text-slate-500">
              صفحه {meta.page} از {meta.pages}
            </span>
            <button
              disabled={page >= meta.pages}
              onClick={() => setPage((value) => value + 1)}
              className="
            rounded-xl
            border
            border-slate-200
            px-4
            py-2
            text-sm
            font-bold
            text-slate-600
            disabled:cursor-not-allowed
            disabled:opacity-40
          ">
              بعدی
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
