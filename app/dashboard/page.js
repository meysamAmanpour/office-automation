"use client"

import { useEffect, useState } from "react"

function StatCard({ icon, title, value, subtitle, iconClass = "" }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {subtitle && (
            <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function StatusItem({ label, value, color, percent }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${color}`} />

          <span className="text-slate-600">{label}</span>
        </div>

        <span className="font-semibold text-slate-800">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-64 rounded-lg bg-slate-200" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-slate-200" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-2xl bg-slate-200" />
        <div className="h-80 rounded-2xl bg-slate-200" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        setError("")

        const response = await fetch("/api/dashboard/summary", {
          method: "GET",
          cache: "no-store",
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || "خطا در دریافت اطلاعات داشبورد")
        }

        setDashboard(result.data)
      } catch (error) {
        setError(error.message || "خطا در دریافت اطلاعات داشبورد")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div dir="rtl" className="p-6">
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div dir="rtl" className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="text-lg font-bold">خطا در دریافت اطلاعات</div>

          <p className="mt-2 text-sm">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  const { letters, users, departments, companies } = dashboard

  const recipientTotal =
    letters.recipients.pending +
    letters.recipients.received +
    letters.recipients.read +
    letters.recipients.archived

  const getPercent = (value) => {
    if (!recipientTotal) return 0

    return Math.round((value / recipientTotal) * 100)
  }

  return (
    <div dir="rtl" className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">
            نمای کلی سیستم
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            داشبورد
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            وضعیت کلی اتوماسیون اداری را در یک نگاه مشاهده کنید.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-400">وضعیت سیستم</p>

          <div className="mt-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

            <span className="text-sm font-semibold text-slate-700">
              سیستم فعال است
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="📨"
          title="کل نامه‌ها"
          value={letters.total}
          subtitle={`${letters.draft} پیش‌نویس`}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          icon="📤"
          title="نامه‌های ارسال‌شده"
          value={letters.sent}
          subtitle="نامه ارسال‌شده"
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          icon="👥"
          title="کاربران"
          value={users.total}
          subtitle={`${users.active} کاربر فعال`}
          iconClass="bg-violet-50 text-violet-600"
        />

        <StatCard
          icon="🏢"
          title="شرکت‌ها"
          value={companies.total}
          subtitle={`${departments.total} دپارتمان`}
          iconClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Main Content */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Letter Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">وضعیت نامه‌ها</h2>

              <p className="mt-1 text-xs text-slate-500">
                خلاصه وضعیت نامه‌های ثبت‌شده
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600">
              {letters.total} نامه
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="text-sm text-slate-500">پیش‌نویس</div>

              <div className="mt-2 text-2xl font-bold text-slate-900">
                {letters.draft}
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50 p-5">
              <div className="text-sm text-emerald-700">ارسال‌شده</div>

              <div className="mt-2 text-2xl font-bold text-emerald-700">
                {letters.sent}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex justify-between text-sm">
              <span className="text-slate-500">وضعیت کلی ارسال</span>

              <span className="font-semibold text-slate-700">
                {letters.total
                  ? Math.round((letters.sent / letters.total) * 100)
                  : 0}
                %
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{
                  width: `${
                    letters.total ? (letters.sent / letters.total) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">وضعیت سازمان</h2>

          <p className="mt-1 text-xs text-slate-500">اطلاعات ساختار سازمانی</p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  🏢
                </span>

                <span className="text-sm text-slate-600">شرکت‌ها</span>
              </div>

              <span className="text-xl font-bold text-slate-900">
                {companies.total}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                  🏛️
                </span>

                <span className="text-sm text-slate-600">دپارتمان‌ها</span>
              </div>

              <span className="text-xl font-bold text-slate-900">
                {departments.total}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  👤
                </span>

                <span className="text-sm text-slate-600">کاربران فعال</span>
              </div>

              <span className="text-xl font-bold text-slate-900">
                {users.active}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Status */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-bold text-slate-900">وضعیت گیرندگان نامه</h2>

          <p className="mt-1 text-xs text-slate-500">
            وضعیت فعلی نامه‌های ارسال‌شده برای گیرندگان
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <StatusItem
            label="در انتظار دریافت"
            value={letters.recipients.pending}
            percent={getPercent(letters.recipients.pending)}
            color="bg-amber-500"
          />

          <StatusItem
            label="دریافت‌شده"
            value={letters.recipients.received}
            percent={getPercent(letters.recipients.received)}
            color="bg-blue-500"
          />

          <StatusItem
            label="خوانده‌شده"
            value={letters.recipients.read}
            percent={getPercent(letters.recipients.read)}
            color="bg-emerald-500"
          />

          <StatusItem
            label="بایگانی‌شده"
            value={letters.recipients.archived}
            percent={getPercent(letters.recipients.archived)}
            color="bg-slate-500"
          />
        </div>
      </div>
    </div>
  )
}
