"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function AuditLogDetailPage() {
  const { id } = useParams()

  const [log, setLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return

    async function fetchLog() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch(`/api/audit-logs/${id}`, {
          method: "GET",
          cache: "no-store",
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || "خطا در دریافت گزارش فعالیت")
        }

        setLog(result.data || null)
      } catch (err) {
        setError(err.message || "خطا در دریافت اطلاعات")
      } finally {
        setLoading(false)
      }
    }

    fetchLog()
  }, [id])

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

  function getActionStyle(value) {
    const styles = {
      REFERRAL_CREATED: "bg-blue-50 text-blue-700 border-blue-200",

      REFERRAL_RECEIVED: "bg-cyan-50 text-cyan-700 border-cyan-200",

      REFERRAL_STARTED: "bg-violet-50 text-violet-700 border-violet-200",

      REFERRAL_COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",

      REFERRAL_REJECTED: "bg-red-50 text-red-700 border-red-200",

      REFERRAL_CANCELLED: "bg-amber-50 text-amber-700 border-amber-200",
    }

    return styles[value] || "bg-slate-50 text-slate-600 border-slate-200"
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

  function formatDate(value) {
    if (!value) return "—"

    return new Date(value).toLocaleString("fa-IR", {
      dateStyle: "full",
      timeStyle: "short",
    })
  }

  function formatMetadataValue(value) {
    if (value === null || value === undefined) {
      return "—"
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2)
    }

    return String(value)
  }

  if (loading) {
    return (
      <div className="min-h-full" dir="rtl">
        <div className="mb-8 h-12 w-72 animate-pulse rounded-xl bg-slate-100" />

        <div className="space-y-5">
          <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full" dir="rtl">
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
          {error}
        </div>

        <Link
          href="/dashboard/audit-logs"
          className="
        inline-flex
        items-center
        gap-2
        rounded-xl
        bg-slate-900
        px-5
        py-3
        text-sm
        font-bold
        text-white
        transition
        hover:bg-slate-800
      ">
          ← بازگشت به گزارش فعالیت‌ها
        </Link>
      </div>
    )
  }

  if (!log) {
    return (
      <div className="min-h-full" dir="rtl">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-20 text-center shadow-sm">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl">
            📭
          </div>

          <h2 className="font-bold text-slate-800">گزارش فعالیت پیدا نشد</h2>

          <Link
            href="/dashboard/audit-logs"
            className="
          mt-5
          rounded-xl
          bg-slate-900
          px-5
          py-3
          text-sm
          font-bold
          text-white
        ">
            بازگشت به گزارش‌ها
          </Link>
        </div>
      </div>
    )
  }

  const metadataEntries =
    log.metadata && typeof log.metadata === "object"
      ? Object.entries(log.metadata)
      : []

  return (
    <div className="min-h-full" dir="rtl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-xl text-white shadow-lg shadow-violet-600/20">
              📋
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                جزئیات گزارش فعالیت
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                مشاهده جزئیات کامل عملیات انجام‌شده
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/audit-logs"
          className="
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        border-slate-200
        bg-white
        px-5
        py-3
        text-sm
        font-bold
        text-slate-700
        shadow-sm
        transition
        hover:bg-slate-50
      ">
          <span>→</span>
          بازگشت
        </Link>
      </div>

      {/* Main information */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span
            className={`
          rounded-full
          border
          px-3
          py-1.5
          text-xs
          font-black
          ${getActionStyle(log.action)}
        `}>
            {getActionLabel(log.action)}
          </span>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
            {getEntityLabel(log.entity)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* User */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-1 text-xs font-bold text-slate-400">
              کاربر انجام‌دهنده
            </div>

            <div className="font-bold text-slate-800">
              {log.user?.fullName || "سیستم"}
            </div>

            {log.user?.username && (
              <div className="mt-1 text-xs text-slate-400">
                نام کاربری: {log.user.username}
              </div>
            )}
          </div>

          {/* Company */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-1 text-xs font-bold text-slate-400">شرکت</div>

            <div className="font-bold text-slate-800">
              {log.company?.name || "—"}
            </div>

            {log.company?.code && (
              <div className="mt-1 text-xs text-slate-400">
                کد شرکت: {log.company.code}
              </div>
            )}
          </div>

          {/* Entity */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-1 text-xs font-bold text-slate-400">موجودیت</div>

            <div className="font-bold text-slate-800">
              {getEntityLabel(log.entity)}
            </div>
          </div>

          {/* Entity ID */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-1 text-xs font-bold text-slate-400">
              شناسه موجودیت
            </div>

            <div className="break-all font-mono text-sm text-slate-700">
              {log.entityId || "—"}
            </div>
          </div>

          {/* Date */}
          <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
            <div className="mb-1 text-xs font-bold text-slate-400">
              تاریخ و ساعت
            </div>

            <div className="font-bold text-slate-800">
              {formatDate(log.createdAt)}
            </div>
          </div>
        </div>

        {/* Description */}
        {log.description && (
          <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-4">
            <div className="mb-2 text-xs font-black text-violet-600">
              توضیحات عملیات
            </div>

            <p className="text-sm leading-7 text-violet-900">
              {log.description}
            </p>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-black text-slate-900">جزئیات عملیات</h2>

          <p className="mt-1 text-xs text-slate-400">
            اطلاعات تکمیلی ثبت‌شده هنگام انجام عملیات
          </p>
        </div>

        {metadataEntries.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            اطلاعات تکمیلی برای این فعالیت ثبت نشده است.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {metadataEntries.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-3 md:gap-6">
                <div className="text-xs font-black text-slate-500">{key}</div>

                <div className="md:col-span-2">
                  {typeof value === "object" ? (
                    <pre
                      dir="ltr"
                      className="
                    overflow-x-auto
                    rounded-xl
                    bg-slate-50
                    p-4
                    text-left
                    text-xs
                    leading-6
                    text-slate-600
                  ">
                      {formatMetadataValue(value)}
                    </pre>
                  ) : (
                    <div className="break-all rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {formatMetadataValue(value)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
