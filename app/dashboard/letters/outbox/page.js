"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function OutboxPage() {
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
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()

      params.set("page", page)
      params.set("limit", "10")

      if (search.trim()) {
        params.set("search", search.trim())
      }

      if (status) {
        params.set("status", status)
      }

      if (priority) {
        params.set("priority", priority)
      }

      const response = await fetch(`/api/letters/outbox?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok) {
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
      setError(err.message || "خطا در دریافت اطلاعات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLetters()
  }, [page, status, priority])

  function handleSearch(event) {
    event.preventDefault()
    setPage(1)
    fetchLetters()
  }

  function clearFilters() {
    setSearch("")
    setStatus("")
    setPriority("")
    setPage(1)
  }

  function getStatusLabel(value) {
    const statuses = {
      DRAFT: "پیش‌نویس",
      SENT: "ارسال شده",
    }

    return statuses[value] || value
  }

  function getPriorityLabel(value) {
    const priorities = {
      LOW: "کم",
      NORMAL: "عادی",
      HIGH: "زیاد",
      URGENT: "فوری",
    }

    return priorities[value] || value
  }

  function getStatusStyle(value) {
    if (value === "DRAFT") {
      return "bg-amber-50 text-amber-700 border-amber-200"
    }

    if (value === "SENT") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    }

    return "bg-slate-50 text-slate-600 border-slate-200"
  }

  function getPriorityStyle(value) {
    if (value === "URGENT") {
      return "bg-red-50 text-red-700 border-red-200"
    }

    if (value === "HIGH") {
      return "bg-orange-50 text-orange-700 border-orange-200"
    }

    if (value === "NORMAL") {
      return "bg-blue-50 text-blue-700 border-blue-200"
    }

    return "bg-slate-50 text-slate-600 border-slate-200"
  }

  return (
    <div className="min-h-full" dir="rtl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-600/20">
              📤
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                نامه‌های ارسالی
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                مدیریت و پیگیری نامه‌های ارسال‌شده
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/letters/drafts"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            py-3
            text-sm
            font-bold
            text-white
            shadow-lg
            shadow-blue-600/20
            transition
            hover:bg-blue-700
          ">
          <span>📝</span>
          پیش‌نویس‌ها
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              مجموع نامه‌ها
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
              📊
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900">{meta.total}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              ارسال شده
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
              ✓
            </span>
          </div>

          <div className="text-2xl font-black text-emerald-600">
            {letters.filter((letter) => letter.status === "SENT").length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">پیش‌نویس</span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
              📝
            </span>
          </div>

          <div className="text-2xl font-black text-amber-600">
            {letters.filter((letter) => letter.status === "DRAFT").length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              صفحه جاری
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg">
              📄
            </span>
          </div>

          <div className="text-2xl font-black text-violet-600">
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
                placeholder="جستجو بر اساس موضوع یا شماره نامه..."
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
                  focus:border-blue-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-500/10
                "
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="mb-2 block text-xs font-bold text-slate-500">
              وضعیت
            </label>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
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
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
              ">
              <option value="">همه وضعیت‌ها</option>
              <option value="SENT">ارسال شده</option>
              <option value="DRAFT">پیش‌نویس</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-2 block text-xs font-bold text-slate-500">
              اولویت
            </label>

            <select
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value)
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
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
              ">
              <option value="">همه اولویت‌ها</option>
              <option value="LOW">کم</option>
              <option value="NORMAL">عادی</option>
              <option value="HIGH">زیاد</option>
              <option value="URGENT">فوری</option>
            </select>
          </div>

          <div className="flex items-end gap-2 lg:col-span-2">
            <button
              type="submit"
              className="
                flex-1
                rounded-xl
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900">لیست نامه‌ها</h2>

              <p className="mt-1 text-xs text-slate-400">
                {meta.total} نامه در سیستم
              </p>
            </div>
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
        ) : letters.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl">
              📭
            </div>

            <h3 className="font-bold text-slate-800">نامه‌ای پیدا نشد</h3>

            <p className="mt-2 text-sm text-slate-400">
              با تغییر فیلترها یا عبارت جستجو دوباره امتحان کنید.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {letters.map((letter) => (
              <Link
                key={letter.id}
                href={`/dashboard/letters/outbox/${letter.id}`}
                className="
                  block
                  p-5
                  transition
                  hover:bg-slate-50
                ">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-bold text-slate-900">
                        {letter.subject || "بدون موضوع"}
                      </h3>

                      <span
                        className={`
                          rounded-full
                          border
                          px-2.5
                          py-1
                          text-[11px]
                          font-bold
                          ${getStatusStyle(letter.status)}
                        `}>
                        {getStatusLabel(letter.status)}
                      </span>

                      <span
                        className={`
                          rounded-full
                          border
                          px-2.5
                          py-1
                          text-[11px]
                          font-bold
                          ${getPriorityStyle(letter.priority)}
                        `}>
                        {getPriorityLabel(letter.priority)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                      <span>شماره: {letter.letterNumber || "—"}</span>

                      <span>فرستنده: {letter.creator?.fullName || "—"}</span>

                      <span>دپارتمان: {letter.department?.name || "—"}</span>

                      <span>
                        {letter.createdAt
                          ? new Date(letter.createdAt).toLocaleDateString(
                              "fa-IR",
                            )
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="rounded-xl bg-slate-50 px-4 py-2 text-center">
                      <div className="text-[10px] text-slate-400">گیرندگان</div>

                      <div className="mt-1 font-black text-slate-700">
                        {letter.recipients?.length || 0}
                      </div>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      ←
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
