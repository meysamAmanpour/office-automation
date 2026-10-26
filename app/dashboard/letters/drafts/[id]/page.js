"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

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

const recipientTypeConfig = {
  USER: {
    label: "کاربر",
    icon: "👤",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  DEPARTMENT: {
    label: "دپارتمان",
    icon: "🏢",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  COMPANY: {
    label: "شرکت",
    icon: "🏛️",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
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

export default function DraftEditPage() {
  const params = useParams()
  const router = useRouter()

  const letterId = params?.id

  const [letter, setLetter] = useState(null)

  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [priority, setPriority] = useState("NORMAL")

  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [companies, setCompanies] = useState([])

  const [recipientType, setRecipientType] = useState("USER")
  const [selectedRecipients, setSelectedRecipients] = useState([])

  const [loading, setLoading] = useState(true)
  const [loadingRecipients, setLoadingRecipients] = useState(true)

  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [recipientSearch, setRecipientSearch] = useState("")

  /*
   * -----------------------------------------
   * دریافت پیش‌نویس
   * -----------------------------------------
   */

  const fetchDraft = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/letters/outbox/${letterId}`, {
        credentials: "include",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "خطا در دریافت پیش‌نویس")
      }

      const data = result.data

      if (data.status !== "DRAFT") {
        throw new Error("این نامه دیگر در وضعیت پیش‌نویس قرار ندارد.")
      }

      setLetter(data)

      setSubject(data.subject || "")
      setBody(data.body || "")
      setPriority(data.priority || "NORMAL")

      /*
       * اگر به هر دلیل پیش‌نویس قبلاً گیرنده داشته باشد،
       * آنها را برای نمایش نگه می‌داریم.
       */
      if (Array.isArray(data.recipients)) {
        const existingRecipients = data.recipients
          .map((recipient) => {
            if (recipient.recipientType === "USER" && recipient.userId) {
              return {
                type: "USER",
                userId: recipient.userId,
                name:
                  recipient.user?.fullName ||
                  recipient.user?.username ||
                  "کاربر",
              }
            }

            if (
              recipient.recipientType === "DEPARTMENT" &&
              recipient.departmentId
            ) {
              return {
                type: "DEPARTMENT",
                departmentId: recipient.departmentId,
                name: recipient.department?.name || "دپارتمان",
              }
            }

            if (recipient.recipientType === "COMPANY" && recipient.companyId) {
              return {
                type: "COMPANY",
                companyId: recipient.companyId,
                name: recipient.company?.name || "شرکت",
              }
            }

            return null
          })
          .filter(Boolean)

        setSelectedRecipients(existingRecipients)
      }
    } catch (err) {
      setError(err.message || "خطایی هنگام دریافت پیش‌نویس رخ داد.")
    } finally {
      setLoading(false)
    }
  }

  /*
   * -----------------------------------------
   * دریافت گیرندگان
   * -----------------------------------------
   */

  const fetchRecipients = async () => {
    try {
      setLoadingRecipients(true)

      const [usersResponse, departmentsResponse, companiesResponse] =
        await Promise.all([
          fetch("/api/users?page=1&limit=100", {
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/departments?page=1&limit=100", {
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/companies?page=1&limit=100", {
            credentials: "include",
            cache: "no-store",
          }),
        ])

      const [usersResult, departmentsResult, companiesResult] =
        await Promise.all([
          usersResponse.json(),
          departmentsResponse.json(),
          companiesResponse.json(),
        ])

      if (!usersResponse.ok || !usersResult.success) {
        throw new Error(usersResult.message || "دریافت کاربران انجام نشد.")
      }

      if (!departmentsResponse.ok || !departmentsResult.success) {
        throw new Error(
          departmentsResult.message || "دریافت دپارتمان‌ها انجام نشد.",
        )
      }

      if (!companiesResponse.ok || !companiesResult.success) {
        throw new Error(companiesResult.message || "دریافت شرکت‌ها انجام نشد.")
      }

      setUsers(
        (usersResult.data || []).filter((user) => user.isActive !== false),
      )

      setDepartments(departmentsResult.data || [])

      setCompanies(
        (companiesResult.data || []).filter(
          (company) => company.isActive !== false,
        ),
      )
    } catch (err) {
      setError(err.message || "خطایی هنگام دریافت گیرندگان رخ داد.")
    } finally {
      setLoadingRecipients(false)
    }
  }

  useEffect(() => {
    if (!letterId) return

    fetchDraft()
    fetchRecipients()
  }, [letterId])

  /*
   * -----------------------------------------
   * گزینه‌های قابل نمایش
   * -----------------------------------------
   */

  const recipientOptions = useMemo(() => {
    let options = []

    if (recipientType === "USER") {
      options = users.map((user) => ({
        id: user.id,
        name: user.fullName || user.username,
        secondary: [user.username, user.company?.name, user.department?.name]
          .filter(Boolean)
          .join(" • "),
        value: {
          type: "USER",
          userId: user.id,
          name: user.fullName || user.username,
        },
      }))
    }

    if (recipientType === "DEPARTMENT") {
      options = departments.map((department) => ({
        id: department.id,
        name: department.name,
        secondary: department.company?.name || "",
        value: {
          type: "DEPARTMENT",
          departmentId: department.id,
          name: department.name,
        },
      }))
    }

    if (recipientType === "COMPANY") {
      options = companies.map((company) => ({
        id: company.id,
        name: company.name,
        secondary: company.code || "",
        value: {
          type: "COMPANY",
          companyId: company.id,
          name: company.name,
        },
      }))
    }

    if (!recipientSearch.trim()) {
      return options
    }

    const search = recipientSearch.trim().toLowerCase()

    return options.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.secondary.toLowerCase().includes(search),
    )
  }, [recipientType, users, departments, companies, recipientSearch])

  /*
   * -----------------------------------------
   * افزودن گیرنده
   * -----------------------------------------
   */

  const addRecipient = (recipient) => {
    const exists = selectedRecipients.some((item) => {
      if (recipient.type !== item.type) return false

      if (recipient.type === "USER") {
        return item.userId === recipient.userId
      }

      if (recipient.type === "DEPARTMENT") {
        return item.departmentId === recipient.departmentId
      }

      if (recipient.type === "COMPANY") {
        return item.companyId === recipient.companyId
      }

      return false
    })

    if (exists) return

    setSelectedRecipients((prev) => [...prev, recipient])
  }

  /*
   * -----------------------------------------
   * حذف گیرنده
   * -----------------------------------------
   */

  const removeRecipient = (index) => {
    setSelectedRecipients((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  /*
   * -----------------------------------------
   * ذخیره پیش‌نویس
   * -----------------------------------------
   */

  const handleSave = async (event) => {
    event.preventDefault()

    if (!subject.trim()) {
      setError("موضوع نامه الزامی است.")
      return
    }

    if (!body.trim()) {
      setError("متن نامه الزامی است.")
      return
    }

    try {
      setSaving(true)
      setError("")
      setSuccessMessage("")

      const response = await fetch(`/api/letters/outbox/${letterId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          priority,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "ذخیره پیش‌نویس انجام نشد.")
      }

      setLetter((prev) => ({
        ...prev,
        ...result.data,
        subject: subject.trim(),
        body: body.trim(),
        priority,
        updatedAt: result.data?.updatedAt || new Date().toISOString(),
      }))

      setSuccessMessage("پیش‌نویس با موفقیت ذخیره شد.")

      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      setError(err.message || "خطایی هنگام ذخیره پیش‌نویس رخ داد.")
    } finally {
      setSaving(false)
    }
  }

  /*
   * -----------------------------------------
   * ارسال نهایی
   * -----------------------------------------
   */

  const handleSend = async () => {
    setError("")
    setSuccessMessage("")

    if (!subject.trim()) {
      setError("قبل از ارسال، موضوع نامه را وارد کنید.")
      return
    }

    if (!body.trim()) {
      setError("قبل از ارسال، متن نامه را وارد کنید.")
      return
    }

    if (selectedRecipients.length === 0) {
      setError("حداقل یک گیرنده برای ارسال نامه انتخاب کنید.")
      return
    }

    const confirmed = window.confirm(
      `آیا از ارسال این نامه برای ${selectedRecipients.length} گیرنده اطمینان دارید؟`,
    )

    if (!confirmed) return

    try {
      setSending(true)

      /*
       * ابتدا آخرین تغییرات نامه را ذخیره می‌کنیم.
       */
      const saveResponse = await fetch(`/api/letters/outbox/${letterId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          priority,
        }),
      })

      const saveResult = await saveResponse.json()

      if (!saveResponse.ok || !saveResult.success) {
        throw new Error(
          saveResult.message || "ذخیره تغییرات قبل از ارسال انجام نشد.",
        )
      }

      /*
       * تبدیل state فرانت به ساختار مورد انتظار بک‌اند
       */
      const recipients = selectedRecipients
        .map((recipient) => {
          if (recipient.type === "USER") {
            return {
              type: "USER",
              userId: recipient.userId,
            }
          }

          if (recipient.type === "DEPARTMENT") {
            return {
              type: "DEPARTMENT",
              departmentId: recipient.departmentId,
            }
          }

          if (recipient.type === "COMPANY") {
            return {
              type: "COMPANY",
              companyId: recipient.companyId,
            }
          }

          return null
        })
        .filter(Boolean)

      const response = await fetch(`/api/letters/outbox/${letterId}/send`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "ارسال نامه انجام نشد.")
      }

      setSuccessMessage("نامه با موفقیت ارسال شد.")

      /*
       * بعد از ارسال موفق، کمی مکث می‌کنیم
       * تا کاربر پیام موفقیت را ببیند.
       */
      setTimeout(() => {
        router.push("/dashboard/letters/outbox")
      }, 1000)
    } catch (err) {
      setError(err.message || "خطایی هنگام ارسال نامه رخ داد.")
    } finally {
      setSending(false)
    }
  }

  const priorityInfo = priorityConfig[priority] || priorityConfig.NORMAL

  /*
   * -----------------------------------------
   * Loading
   * -----------------------------------------
   */

  if (loading) {
    return (
      <div dir="rtl" className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-[600px] animate-pulse rounded-2xl bg-slate-200 lg:col-span-2" />
          <div className="h-[500px] animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    )
  }

  /*
   * -----------------------------------------
   * Error
   * -----------------------------------------
   */

  if (error && !letter) {
    return (
      <div dir="rtl" className="space-y-6">
        <Link
          href="/dashboard/letters/drafts"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600">
          ← بازگشت به پیش‌نویس‌ها
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-bold text-red-800">خطا در دریافت پیش‌نویس</h2>

          <p className="mt-2 text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={fetchDraft}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  /*
   * -----------------------------------------
   * UI
   * -----------------------------------------
   */

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/dashboard" className="hover:text-blue-600">
              داشبورد
            </Link>

            <span>/</span>

            <Link
              href="/dashboard/letters/drafts"
              className="hover:text-blue-600">
              پیش‌نویس‌ها
            </Link>

            <span>/</span>

            <span className="text-slate-700">ویرایش</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              ویرایش و ارسال نامه
            </h1>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              پیش‌نویس
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${priorityInfo.className}`}>
              اولویت: {priorityInfo.label}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            نامه را تکمیل کنید، گیرندگان را انتخاب کنید و در نهایت ارسال نمایید.
          </p>
        </div>

        <Link
          href="/dashboard/letters/drafts"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">
          ← بازگشت
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <div className="flex items-center gap-3">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* =========================
            MAIN EDITOR
        ========================== */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-bold text-slate-900">محتوای نامه</h2>

              <p className="mt-1 text-xs text-slate-500">
                موضوع و متن نامه را تکمیل یا اصلاح کنید.
              </p>
            </div>

            <div className="space-y-5 p-6">
              {/* Subject */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  موضوع نامه
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="موضوع نامه را وارد کنید..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Body */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  متن نامه
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="متن نامه را وارد کنید..."
                  rows={18}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-8 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

                <div className="mt-1 text-left text-xs text-slate-400">
                  {body.length} کاراکتر
                </div>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                ذخیره تغییرات
              </p>

              <p className="mt-1 text-xs text-slate-400">
                ذخیره کردن، نامه را همچنان به صورت پیش‌نویس نگه می‌دارد.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || sending}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "در حال ذخیره..." : "ذخیره پیش‌نویس"}
            </button>
          </div>
        </div>

        {/* =========================
            SIDEBAR
        ========================== */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-slate-900">تنظیمات نامه</h2>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                اولویت
              </label>

              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100">
                <option value="LOW">کم</option>
                <option value="NORMAL">عادی</option>
                <option value="HIGH">مهم</option>
                <option value="URGENT">فوری</option>
              </select>
            </div>
          </div>

          {/* =========================
              RECIPIENTS
          ========================== */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">گیرندگان</h2>

                  <p className="mt-1 text-xs text-slate-400">
                    حداقل یک گیرنده انتخاب کنید.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                  {selectedRecipients.length}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {/* Recipient Type */}
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(recipientTypeConfig).map(([type, config]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setRecipientType(type)
                      setRecipientSearch("")
                    }}
                    className={`rounded-xl border px-2 py-3 text-xs font-medium transition ${
                      recipientType === type
                        ? config.className
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}>
                    <div className="text-base">{config.icon}</div>

                    <div className="mt-1">{config.label}</div>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={recipientSearch}
                  onChange={(event) => setRecipientSearch(event.target.value)}
                  placeholder={
                    recipientType === "USER"
                      ? "جستجوی کاربر..."
                      : recipientType === "DEPARTMENT"
                        ? "جستجوی دپارتمان..."
                        : "جستجوی شرکت..."
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
              </div>

              {/* Options */}
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {loadingRecipients && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    در حال دریافت گیرندگان...
                  </div>
                )}

                {!loadingRecipients && recipientOptions.length === 0 && (
                  <div className="rounded-xl bg-slate-50 px-4 py-6 text-center text-xs text-slate-400">
                    گزینه‌ای پیدا نشد.
                  </div>
                )}

                {!loadingRecipients &&
                  recipientOptions.map((option) => {
                    const isSelected = selectedRecipients.some((item) => {
                      if (item.type !== recipientType) {
                        return false
                      }

                      if (recipientType === "USER") {
                        return item.userId === option.id
                      }

                      if (recipientType === "DEPARTMENT") {
                        return item.departmentId === option.id
                      }

                      return item.companyId === option.id
                    })

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={isSelected}
                        onClick={() => addRecipient(option.value)}
                        className={`w-full rounded-xl border p-3 text-right transition ${
                          isSelected
                            ? "cursor-not-allowed border-emerald-200 bg-emerald-50"
                            : "border-slate-200 hover:border-blue-200 hover:bg-blue-50"
                        }`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {option.name}
                            </p>

                            {option.secondary && (
                              <p className="mt-1 truncate text-xs text-slate-400">
                                {option.secondary}
                              </p>
                            )}
                          </div>

                          <span className="shrink-0 text-sm">
                            {isSelected ? "✓" : "+"}
                          </span>
                        </div>
                      </button>
                    )
                  })}
              </div>

              {/* Selected */}
              {selectedRecipients.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    گیرندگان انتخاب‌شده
                  </p>

                  <div className="space-y-2">
                    {selectedRecipients.map((recipient, index) => {
                      const config = recipientTypeConfig[recipient.type]

                      return (
                        <div
                          key={`${recipient.type}-${index}`}
                          className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${config.className}`}>
                          <div className="flex min-w-0 items-center gap-2">
                            <span>{config.icon}</span>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium">
                                {recipient.name}
                              </p>

                              <p className="text-[10px] opacity-70">
                                {config.label}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeRecipient(index)}
                            className="shrink-0 rounded-lg px-2 py-1 text-xs hover:bg-white/70">
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Letter info */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-slate-900">اطلاعات نامه</h2>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-xs text-slate-400">شماره</span>

                <span className="text-sm font-medium text-slate-700">
                  {letter?.letterNumber || "تخصیص نیافته"}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-xs text-slate-400">ایجاد</span>

                <span className="text-left text-xs text-slate-700">
                  {formatDate(letter?.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-xs text-slate-400">آخرین تغییر</span>

                <span className="text-left text-xs text-slate-700">
                  {formatDate(letter?.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Send */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="mb-4">
              <h3 className="font-bold text-emerald-900">آماده ارسال؟</h3>

              <p className="mt-1 text-xs leading-6 text-emerald-700">
                پس از ارسال، نامه از حالت پیش‌نویس خارج می‌شود و برای گیرندگان
                انتخاب‌شده ارسال خواهد شد.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={sending || saving || selectedRecipients.length === 0}
              className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
              {sending
                ? "در حال ارسال..."
                : `ارسال نامه${
                    selectedRecipients.length
                      ? ` (${selectedRecipients.length})`
                      : ""
                  }`}
            </button>

            {selectedRecipients.length === 0 && (
              <p className="mt-2 text-center text-[11px] text-emerald-700">
                ابتدا حداقل یک گیرنده انتخاب کنید.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
