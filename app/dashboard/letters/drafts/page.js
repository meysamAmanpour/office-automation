"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const priorityConfig = {
  LOW: {
    label: "کم",
    className: "bg-slate-100 text-slate-700",
  },
  NORMAL: {
    label: "عادی",
    className: "bg-blue-100 text-blue-700",
  },
  HIGH: {
    label: "مهم",
    className: "bg-orange-100 text-orange-700",
  },
  URGENT: {
    label: "فوری",
    className: "bg-red-100 text-red-700",
  },
}

const formatDate = (date) => {
  if (!date) return "-"

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export default function DraftsPage() {
  const [letters, setLetters] = useState([])
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })

  const [draftCount, setDraftCount] = useState(0)

  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [priority, setPriority] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [deletingId, setDeletingId] = useState(null)

  const fetchDrafts = async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()

      params.set("status", "DRAFT")
      params.set("page", meta.page)
      params.set("limit", meta.limit)

      if (appliedSearch.trim()) {
        params.set("search", appliedSearch.trim())
      }

      if (priority) {
        params.set("priority", priority)
      }

      const response = await fetch(`/api/letters/outbox?${params.toString()}`, {
        credentials: "include",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "خطا در دریافت پیش‌نویس‌ها")
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

      setDraftCount(result.meta?.total || 0)
    } catch (err) {
      setError(err.message || "خطایی رخ داده است")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrafts()
  }, [meta.page, appliedSearch, priority])

  const handleSearch = (event) => {
    event.preventDefault()

    setMeta((prev) => ({
      ...prev,
      page: 1,
    }))

    setAppliedSearch(search)
  }

  const handleClearFilters = () => {
    setSearch("")
    setAppliedSearch("")
    setPriority("")

    setMeta((prev) => ({
      ...prev,
      page: 1,
    }))
  }

  const handleDelete = async (letterId) => {
    const confirmed = window.confirm("آیا از حذف این پیش‌نویس اطمینان دارید؟")

    if (!confirmed) return

    try {
      setDeletingId(letterId)

      const response = await fetch(`/api/letters/outbox/${letterId}`, {
        method: "DELETE",
        credentials: "include",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "حذف پیش‌نویس انجام نشد")
      }

      await fetchDrafts()
    } catch (err) {
      alert(err.message || "خطا در حذف پیش‌نویس")
    } finally {
      setDeletingId(null)
    }
  }

  const goToPage = (page) => {
    if (page < 1 || page > meta.pages) return

    setMeta((prev) => ({
      ...prev,
      page,
    }))
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/dashboard" className="transition hover:text-blue-600">
              داشبورد
            </Link>

            <span>/</span>

            <span className="text-slate-700">پیش‌نویس‌ها</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">پیش‌نویس‌های من</h1>

          <p className="mt-1 text-sm text-slate-500">
            نامه‌هایی که هنوز ارسال نشده‌اند و می‌توانید آنها را تکمیل و ارسال
            کنید.
          </p>
        </div>

        <Link
          href="/dashboard/letters/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
          <span className="text-lg">＋</span>
          نامه جدید
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">کل پیش‌نویس‌ها</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {draftCount}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl">
              📝
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">نمایش در این صفحه</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {letters.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              📄
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">صفحه فعلی</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {meta.page}
                <span className="mx-1 text-base font-normal text-slate-400">
                  از
                </span>
                {meta.pages}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
              📚
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              جستجو
            </label>

            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="موضوع یا شماره نامه..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              اولویت
            </label>

            <select
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value)

                setMeta((prev) => ({
                  ...prev,
                  page: 1,
                }))
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100">
              <option value="">همه اولویت‌ها</option>
              <option value="LOW">کم</option>
              <option value="NORMAL">عادی</option>
              <option value="HIGH">مهم</option>
              <option value="URGENT">فوری</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
              جستجو
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              پاک
            </button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>

            <button
              onClick={fetchDrafts}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700">
              تلاش مجدد
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex justify-between">
                <div className="h-5 w-2/5 rounded bg-slate-200" />
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </div>

              <div className="mb-3 h-4 w-3/4 rounded bg-slate-200" />

              <div className="h-3 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && letters.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
            📝
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            پیش‌نویسی پیدا نشد
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            هنوز پیش‌نویسی ایجاد نکرده‌اید یا نتیجه‌ای مطابق فیلترهای انتخاب‌شده
            وجود ندارد.
          </p>

          <Link
            href="/dashboard/letters/create"
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
            ایجاد نامه جدید
          </Link>
        </div>
      )}

      {/* Drafts */}
      {!loading && !error && letters.length > 0 && (
        <div className="space-y-4">
          {letters.map((letter) => {
            const priorityInfo =
              priorityConfig[letter.priority] || priorityConfig.NORMAL

            return (
              <div
                key={letter.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                {/* Top */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        پیش‌نویس
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${priorityInfo.className}`}>
                        اولویت: {priorityInfo.label}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                      {letter.subject || "بدون موضوع"}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {letter.body || "متن نامه هنوز وارد نشده است."}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/dashboard/letters/drafts/${letter.id}`}
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-blue-700">
                      ادامه ویرایش
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(letter.id)}
                      disabled={deletingId === letter.id}
                      className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                      {deletingId === letter.id ? "در حال حذف..." : "حذف"}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">شماره نامه</p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {letter.letterNumber || "تخصیص نیافته"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">گیرندگان</p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {letter.recipients?.length
                        ? `${letter.recipients.length} گیرنده`
                        : "تعیین نشده"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">ایجاد شده</p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {formatDate(letter.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">آخرین تغییر</p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {formatDate(letter.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && meta.pages > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            صفحه {meta.page} از {meta.pages} — مجموع {meta.total} پیش‌نویس
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(meta.page - 1)}
              disabled={meta.page === 1}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              قبلی
            </button>

            <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-blue-600 px-3 text-sm font-medium text-white">
              {meta.page}
            </div>

            <button
              type="button"
              onClick={() => goToPage(meta.page + 1)}
              disabled={meta.page === meta.pages}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
