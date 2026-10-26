"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import ReferralTimeline from "@/components/letters/Referraltimeline"

export default function OutboxDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [letter, setLetter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [referrals, setReferrals] = useState([])
  const [referralsLoading, setReferralsLoading] = useState(false)
  const [referralsError, setReferralsError] = useState("")

  // Referral modal
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [referralType, setReferralType] = useState("USER")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("")
  const [referralDescription, setReferralDescription] = useState("")
  const [referralPriority, setReferralPriority] = useState("NORMAL")
  const [referralDueDate, setReferralDueDate] = useState("")

  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])

  const [usersLoading, setUsersLoading] = useState(false)
  const [departmentsLoading, setDepartmentsLoading] = useState(false)

  const [referralSubmitting, setReferralSubmitting] = useState(false)
  const [referralSubmitError, setReferralSubmitError] = useState("")
  const [referralSuccess, setReferralSuccess] = useState("")

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedCancelReferral, setSelectedCancelReferral] = useState(null)
  const [cancellationReason, setCancellationReason] = useState("")
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState("")

  const [currentUser, setCurrentUser] = useState(null)

  const [attachmentFile, setAttachmentFile] = useState(null)
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [attachmentError, setAttachmentError] = useState("")
  const [attachmentSuccess, setAttachmentSuccess] = useState("")
  const [uploadedAttachment, setUploadedAttachment] = useState(null)

  const [attachments, setAttachments] = useState([])
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [attachmentsError, setAttachmentsError] = useState("")

  const id = params?.id

  useEffect(() => {
    if (!id) return

    async function fetchLetter() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch(`/api/letters/outbox/${id}`, {
          method: "GET",
          cache: "no-store",
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || "خطا در دریافت نامه")
        }

        setLetter(result.data)
      } catch (err) {
        setError(err.message || "خطا در دریافت اطلاعات نامه")
      } finally {
        setLoading(false)
      }
    }

    fetchLetter()
    fetchReferrals()
    fetchCurrentUser()
    fetchAttachments()
  }, [id])

  async function fetchCurrentUser() {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      })

      const contentType = response.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        throw new Error("پاسخ اطلاعات کاربر JSON نیست")
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "دریافت اطلاعات کاربر ناموفق بود")
      }

      setCurrentUser(result.data)
    } catch (error) {
      console.error("FETCH CURRENT USER ERROR:", error)
      setCurrentUser(null)
    }
  }

  async function fetchReferrals() {
    if (!id) return

    try {
      setReferralsLoading(true)
      setReferralsError("")

      const response = await fetch(`/api/letters/referrals/${id}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "دریافت مسیر ارجاع با خطا مواجه شد")
      }

      setReferrals(result.data || [])
    } catch (error) {
      setReferralsError(error.message || "دریافت مسیر ارجاع با خطا مواجه شد")
    } finally {
      setReferralsLoading(false)
    }
  }

  async function fetchAttachments() {
    if (!id) return

    try {
      setAttachmentsLoading(true)
      setAttachmentsError("")

      const response = await fetch(`/api/letters/${id}/attachments`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "دریافت پیوست‌های نامه ناموفق بود")
      }

      setAttachments(result.data || [])
    } catch (error) {
      setAttachmentsError(error.message || "دریافت پیوست‌های نامه ناموفق بود")
    } finally {
      setAttachmentsLoading(false)
    }
  }

  async function handleUploadAttachment(event) {
    event.preventDefault()

    if (!id) {
      setAttachmentError("شناسه نامه مشخص نیست.")
      return
    }

    if (!attachmentFile) {
      setAttachmentError("ابتدا یک فایل انتخاب کنید.")
      return
    }

    try {
      setAttachmentUploading(true)
      setAttachmentError("")
      setAttachmentSuccess("")
      setUploadedAttachment(null)

      const formData = new FormData()
      formData.append("file", attachmentFile)

      const response = await fetch(`/api/letters/${id}/attachments`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "آپلود فایل با خطا مواجه شد.")
      }

      setUploadedAttachment(result.data)
      setAttachmentSuccess("فایل با موفقیت به نامه پیوست شد.")
      await fetchAttachments()
      setAttachmentFile(null)

      // فرم انتخاب فایل را پس از آپلود موفق پاک می‌کند.
      event.target.reset()
    } catch (error) {
      setAttachmentError(error.message || "آپلود فایل با خطا مواجه شد.")
    } finally {
      setAttachmentUploading(false)
    }
  }

  async function handleDownloadAttachment(attachment) {
    try {
      const response = await fetch(
        `/api/letters/${id}/attachments/${attachment.id}`,
        {
          method: "GET",
          credentials: "include",
        },
      )

      if (!response.ok) {
        let message = "دانلود فایل ناموفق بود"

        try {
          const result = await response.json()
          message = result.message || message
        } catch {}

        throw new Error(message)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = attachment.originalName
      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(url)
    } catch (error) {
      alert(error.message || "دانلود فایل ناموفق بود")
    }
  }

  async function fetchReferralTargets() {
    try {
      setUsersLoading(true)
      setDepartmentsLoading(true)

      const [usersResponse, departmentsResponse] = await Promise.all([
        fetch("/api/users?page=1&limit=100", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),

        fetch("/api/departments?page=1&limit=100", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
      ])

      const usersResult = await usersResponse.json()
      const departmentsResult = await departmentsResponse.json()

      if (!usersResponse.ok) {
        throw new Error(usersResult.message || "دریافت کاربران با خطا مواجه شد")
      }

      if (!departmentsResponse.ok) {
        throw new Error(
          departmentsResult.message || "دریافت واحدها با خطا مواجه شد",
        )
      }

      setUsers(usersResult.data || [])
      setDepartments(departmentsResult.data || [])
    } catch (error) {
      setReferralSubmitError(
        error.message || "دریافت گیرندگان ارجاع با خطا مواجه شد",
      )
    } finally {
      setUsersLoading(false)
      setDepartmentsLoading(false)
    }
  }

  function openReferralModal() {
    setReferralType("USER")
    setSelectedUserId("")
    setSelectedDepartmentId("")
    setReferralDescription("")
    setReferralPriority("NORMAL")
    setReferralDueDate("")
    setReferralSubmitError("")
    setReferralSuccess("")

    setShowReferralModal(true)

    if (!users.length && !departments.length) {
      fetchReferralTargets()
    }
  }

  function closeReferralModal() {
    if (referralSubmitting) return

    setShowReferralModal(false)
    setReferralSubmitError("")
    setReferralSuccess("")
  }

  async function handleCreateReferral(event) {
    event.preventDefault()

    if (!id) {
      setReferralSubmitError("شناسه نامه مشخص نیست.")
      return
    }

    if (referralType === "USER" && !selectedUserId) {
      setReferralSubmitError("لطفاً کاربر مقصد را انتخاب کنید.")
      return
    }

    if (referralType === "DEPARTMENT" && !selectedDepartmentId) {
      setReferralSubmitError("لطفاً واحد مقصد را انتخاب کنید.")
      return
    }

    try {
      setReferralSubmitting(true)
      setReferralSubmitError("")
      setReferralSuccess("")

      const payload = {
        letterId: id,
        targetType: referralType,

        targetUserId: referralType === "USER" ? selectedUserId : null,

        targetDepartmentId:
          referralType === "DEPARTMENT" ? selectedDepartmentId : null,

        parentId: null,

        description: referralDescription.trim() || null,

        priority: referralPriority,

        dueDate: referralDueDate
          ? new Date(`${referralDueDate}T23:59:59`).toISOString()
          : null,
      }

      const response = await fetch("/api/letters/referrals", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "ثبت ارجاع با خطا مواجه شد")
      }

      setReferralSuccess("ارجاع نامه با موفقیت ثبت شد.")

      await fetchReferrals()

      setTimeout(() => {
        setShowReferralModal(false)

        setReferralType("USER")
        setSelectedUserId("")
        setSelectedDepartmentId("")
        setReferralDescription("")
        setReferralPriority("NORMAL")
        setReferralDueDate("")
        setReferralSuccess("")
      }, 700)
    } catch (error) {
      setReferralSubmitError(error.message || "ثبت ارجاع با خطا مواجه شد")
    } finally {
      setReferralSubmitting(false)
    }
  }

  function openCancelReferralModal(referral) {
    setSelectedCancelReferral(referral)
    setCancellationReason("")
    setCancelError("")
    setCancelModalOpen(true)
  }

  async function handleCancelReferral() {
    if (!selectedCancelReferral) return

    try {
      setCancelLoading(true)
      setCancelError("")

      const response = await fetch(
        `/api/letters/referrals/${selectedCancelReferral.id}/cancel`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: cancellationReason || null,
          }),
        },
      )

      const contentType = response.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        const text = await response.text()

        console.error("CANCEL REFERRAL NON JSON RESPONSE:", {
          status: response.status,
          text,
        })

        throw new Error(`پاسخ سرور JSON نیست. Status: ${response.status}`)
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "لغو ارجاع با خطا مواجه شد")
      }

      setCancelModalOpen(false)
      setSelectedCancelReferral(null)
      setCancellationReason("")

      await fetchReferrals()
    } catch (error) {
      console.error("CANCEL REFERRAL ERROR:", error)

      setCancelError(error.message || "لغو ارجاع با خطا مواجه شد")
    } finally {
      setCancelLoading(false)
    }
  }

  function getStatusLabel(status) {
    const statuses = {
      DRAFT: "پیش‌نویس",
      SENT: "ارسال شده",
    }

    return statuses[status] || status || "—"
  }

  function getPriorityLabel(priority) {
    const priorities = {
      LOW: "کم",
      NORMAL: "عادی",
      HIGH: "زیاد",
      URGENT: "فوری",
    }

    return priorities[priority] || priority || "—"
  }

  function getStatusStyle(status) {
    if (status === "DRAFT") {
      return "bg-amber-50 text-amber-700 border-amber-200"
    }

    if (status === "SENT") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    }

    return "bg-slate-50 text-slate-600 border-slate-200"
  }

  function getPriorityStyle(priority) {
    if (priority === "URGENT") {
      return "bg-red-50 text-red-700 border-red-200"
    }

    if (priority === "HIGH") {
      return "bg-orange-50 text-orange-700 border-orange-200"
    }

    if (priority === "NORMAL") {
      return "bg-blue-50 text-blue-700 border-blue-200"
    }

    return "bg-slate-50 text-slate-600 border-slate-200"
  }

  function formatDate(date) {
    if (!date) return "—"

    return new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function formatDateTime(date) {
    if (!date) return "—"

    return new Date(date).toLocaleString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-full" dir="rtl">
        <div className="mb-6 h-10 w-48 animate-pulse rounded-xl bg-slate-200" />

        <div className="space-y-5">
          <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    )
  }

  if (error || !letter) {
    return (
      <div className="min-h-full" dir="rtl">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
              ⚠️
            </div>

            <h2 className="text-lg font-black text-red-800">نامه پیدا نشد</h2>

            <p className="mt-2 text-sm text-red-600">
              {error || "اطلاعات این نامه قابل دریافت نیست."}
            </p>

            <button
              onClick={() => router.push("/dashboard/letters/outbox")}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
              بازگشت به نامه‌های ارسالی
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-full pb-10" dir="rtl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/letters/outbox"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50">
              →
            </Link>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                جزئیات نامه ارسالی
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                مشاهده کامل اطلاعات و وضعیت نامه
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                letter.status,
              )}`}>
              {getStatusLabel(letter.status)}
            </span>

            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getPriorityStyle(
                letter.priority,
              )}`}>
              اولویت: {getPriorityLabel(letter.priority)}
            </span>

            {letter.status === "SENT" && (
              <button
                onClick={openReferralModal}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
                ↗️ ارجاع نامه
              </button>
            )}
          </div>
        </div>

        {/* Main information */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Letter content */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
                <div className="mb-2 text-xs font-bold text-slate-400">
                  موضوع نامه
                </div>

                <h2 className="text-xl font-black leading-8 text-slate-900">
                  {letter.subject || "بدون موضوع"}
                </h2>
              </div>

              <div className="px-6 py-6">
                <div className="mb-3 text-xs font-bold text-slate-400">
                  متن نامه
                </div>

                <div className="min-h-52 whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-5 text-sm leading-8 text-slate-700">
                  {letter.body || "متن نامه ثبت نشده است."}
                </div>
              </div>
            </div>
          </div>

          {/* Letter information */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-5 font-black text-slate-900">اطلاعات نامه</h3>

              <div className="space-y-4">
                <InfoRow
                  label="شماره نامه"
                  value={letter.letterNumber || "تعیین نشده"}
                />

                <InfoRow label="نوع نامه" value={letter.type || "—"} />

                <InfoRow
                  label="اولویت"
                  value={getPriorityLabel(letter.priority)}
                />

                <InfoRow label="وضعیت" value={getStatusLabel(letter.status)} />

                <InfoRow
                  label="تاریخ ایجاد"
                  value={formatDate(letter.createdAt)}
                />

                <InfoRow
                  label="آخرین بروزرسانی"
                  value={formatDateTime(letter.updatedAt)}
                />
              </div>
            </div>

            {/* Creator */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-5 font-black text-slate-900">ایجاد کننده</h3>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700">
                  {letter.creator?.fullName?.charAt(0) || "U"}
                </div>

                <div className="min-w-0">
                  <div className="truncate font-bold text-slate-800">
                    {letter.creator?.fullName || "—"}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    @{letter.creator?.username || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Letter attachments */}
        {currentUser?.id === letter.creatorId && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="font-black text-slate-900">پیوست اصلی نامه</h3>
              <p className="mt-1 text-sm text-slate-500">
                فایل نامه را انتخاب و به این نامه اضافه کنید.
              </p>
            </div>

            <form onSubmit={handleUploadAttachment} className="space-y-4">
              <div>
                <label
                  htmlFor="letter-attachment"
                  className="mb-2 block text-sm font-bold text-slate-700">
                  انتخاب فایل
                </label>

                <input
                  id="letter-attachment"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  disabled={attachmentUploading}
                  onChange={(event) => {
                    setAttachmentFile(event.target.files?.[0] || null)
                    setAttachmentError("")
                    setAttachmentSuccess("")
                    setUploadedAttachment(null)
                  }}
                  className="block w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-700 file:ml-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-bold file:text-blue-700"
                />

                <p className="mt-2 text-xs text-slate-400">
                  فرمت‌های مجاز: PDF، JPG، PNG و DOCX — حداکثر ۱۰ مگابایت
                </p>
              </div>

              {attachmentFile && (
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-bold">{attachmentFile.name}</p>
                  <p className="mt-1">
                    حجم: {(attachmentFile.size / (1024 * 1024)).toFixed(2)}{" "}
                    مگابایت
                  </p>
                </div>
              )}

              {attachmentError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {attachmentError}
                </div>
              )}

              {attachmentSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {attachmentSuccess}
                </div>
              )}

              {uploadedAttachment && (
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-bold text-slate-800">
                    فایل ثبت‌شده: {uploadedAttachment.originalName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    شناسه پیوست: {uploadedAttachment.id}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!attachmentFile || attachmentUploading}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {attachmentUploading ? "در حال آپلود فایل..." : "آپلود پیوست"}
              </button>
            </form>
          </div>
        )}

        {/* Uploaded attachments list */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="font-black text-slate-900">فایل‌های پیوست نامه</h3>
            <p className="mt-1 text-sm text-slate-500">
              فهرست فایل‌های ثبت‌شده برای این نامه
            </p>
          </div>

          {attachmentsLoading ? (
            <p className="py-5 text-sm text-slate-500">
              در حال دریافت فهرست پیوست‌ها...
            </p>
          ) : attachmentsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {attachmentsError}
              <button
                type="button"
                onClick={fetchAttachments}
                className="mr-3 font-bold underline">
                تلاش مجدد
              </button>
            </div>
          ) : attachments.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              هنوز فایلی برای این نامه ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                      📎
                    </div>

                    <div className="min-w-0">
                      <p className="break-words font-bold text-slate-800">
                        {attachment.originalName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        حجم: {(attachment.size / (1024 * 1024)).toFixed(2)}{" "}
                        مگابایت
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        بارگذاری‌کننده: {attachment.uploadedBy?.fullName || "—"}
                        {" · "}
                        {formatDateTime(attachment.createdAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadAttachment(attachment)}
                    className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">
                    دانلود فایل
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-black text-slate-900">اطلاعات سازمانی</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoBox
              title="دپارتمان"
              value={letter.department?.name || "—"}
              icon="🏢"
            />

            <InfoBox
              title="تاریخ ارسال / ایجاد"
              value={formatDateTime(letter.createdAt)}
              icon="📅"
            />
          </div>
        </div>

        {/* Recipients */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900">گیرندگان نامه</h3>

                <p className="mt-1 text-xs text-slate-400">
                  {letter.recipients?.length || 0} گیرنده
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                👥
              </div>
            </div>
          </div>

          {!letter.recipients?.length ? (
            <div className="p-8 text-center text-sm text-slate-400">
              گیرنده‌ای برای این نامه ثبت نشده است.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {letter.recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                      {recipient.recipientType === "USER"
                        ? "👤"
                        : recipient.recipientType === "DEPARTMENT"
                          ? "🏢"
                          : "🏛️"}
                    </div>

                    <div>
                      <div className="font-bold text-slate-800">
                        {recipient.recipientType === "USER" &&
                          (recipient.user?.fullName || "کاربر")}

                        {recipient.recipientType === "DEPARTMENT" &&
                          (recipient.department?.name || "دپارتمان")}

                        {recipient.recipientType === "COMPANY" &&
                          (recipient.company?.name || "شرکت")}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {recipient.recipientType === "USER" &&
                          `@${recipient.user?.username || "—"}`}

                        {recipient.recipientType === "DEPARTMENT" &&
                          "گیرنده از نوع دپارتمان"}

                        {recipient.recipientType === "COMPANY" &&
                          "گیرنده از نوع شرکت"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                      {recipient.recipientType === "USER"
                        ? "کاربر"
                        : recipient.recipientType === "DEPARTMENT"
                          ? "دپارتمان"
                          : "شرکت"}
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700">
                      {recipient.status || "PENDING"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referral timeline */}
        <div className="mt-6">
          {referralsLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <p className="text-sm text-gray-500">
                در حال دریافت مسیر ارجاع...
              </p>
            </div>
          ) : referralsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{referralsError}</p>
            </div>
          ) : (
            <ReferralTimeline
              referrals={referrals}
              renderActions={(referral) => (
                <>
                  {(referral.status === "PENDING" ||
                    referral.status === "RECEIVED") &&
                    currentUser?.id === referral.senderId && (
                      <button
                        type="button"
                        onClick={() => openCancelReferralModal(referral)}
                        disabled={cancelLoading}
                        className="rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
                        🚫 لغو ارجاع
                      </button>
                    )}
                </>
              )}
            />
          )}
        </div>

        {/* Footer action */}
        <div className="mt-6 flex justify-start">
          <Link
            href="/dashboard/letters/outbox"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
            بازگشت به نامه‌های ارسالی
          </Link>
        </div>
      </div>

      {/* Referral Modal */}
      {showReferralModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          dir="rtl"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReferralModal()
            }
          }}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  ارجاع نامه
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  نامه را برای کاربر یا واحد دیگری ارجاع دهید.
                </p>
              </div>

              <button
                type="button"
                onClick={closeReferralModal}
                disabled={referralSubmitting}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateReferral} className="space-y-5 p-6">
              {/* Target type */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  نوع گیرنده
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReferralType("USER")
                      setSelectedDepartmentId("")
                      setReferralSubmitError("")
                    }}
                    className={`rounded-xl border px-4 py-4 text-sm font-bold transition ${
                      referralType === "USER"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}>
                    👤 ارجاع به کاربر
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReferralType("DEPARTMENT")
                      setSelectedUserId("")
                      setReferralSubmitError("")
                    }}
                    className={`rounded-xl border px-4 py-4 text-sm font-bold transition ${
                      referralType === "DEPARTMENT"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}>
                    🏢 ارجاع به واحد
                  </button>
                </div>
              </div>

              {/* User */}
              {referralType === "USER" && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    کاربر مقصد
                  </label>

                  <select
                    value={selectedUserId}
                    onChange={(event) => setSelectedUserId(event.target.value)}
                    disabled={usersLoading || referralSubmitting}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100">
                    <option value="">
                      {usersLoading
                        ? "در حال دریافت کاربران..."
                        : "انتخاب کاربر"}
                    </option>

                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName || user.username}
                        {user.username ? ` (@${user.username})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Department */}
              {referralType === "DEPARTMENT" && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    واحد مقصد
                  </label>

                  <select
                    value={selectedDepartmentId}
                    onChange={(event) =>
                      setSelectedDepartmentId(event.target.value)
                    }
                    disabled={departmentsLoading || referralSubmitting}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100">
                    <option value="">
                      {departmentsLoading
                        ? "در حال دریافت واحدها..."
                        : "انتخاب واحد"}
                    </option>

                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  اولویت ارجاع
                </label>

                <select
                  value={referralPriority}
                  onChange={(event) => setReferralPriority(event.target.value)}
                  disabled={referralSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100">
                  <option value="LOW">کم</option>
                  <option value="NORMAL">عادی</option>
                  <option value="HIGH">زیاد</option>
                  <option value="URGENT">فوری</option>
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  مهلت انجام
                </label>

                <input
                  type="date"
                  value={referralDueDate}
                  onChange={(event) => setReferralDueDate(event.target.value)}
                  disabled={referralSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  در صورت نیاز مهلت انجام ارجاع را مشخص کنید.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  توضیحات ارجاع
                </label>

                <textarea
                  value={referralDescription}
                  onChange={(event) =>
                    setReferralDescription(event.target.value)
                  }
                  disabled={referralSubmitting}
                  rows={5}
                  maxLength={2000}
                  placeholder="توضیحات یا دستور لازم برای گیرنده ارجاع..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <div className="mt-1 text-left text-[11px] text-slate-400">
                  {referralDescription.length} / 2000
                </div>
              </div>

              {/* Error */}
              {referralSubmitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex gap-2">
                    <span>⚠️</span>

                    <p className="text-sm leading-6 text-red-700">
                      {referralSubmitError}
                    </p>
                  </div>
                </div>
              )}

              {/* Success */}
              {referralSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex gap-2">
                    <span>✅</span>

                    <p className="text-sm font-bold text-emerald-700">
                      {referralSuccess}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={closeReferralModal}
                  disabled={referralSubmitting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={referralSubmitting}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {referralSubmitting
                    ? "در حال ثبت ارجاع..."
                    : "ثبت و ارسال ارجاع"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">لغو ارجاع</h2>

                <p className="mt-1 text-sm text-gray-500">
                  آیا از لغو این ارجاع اطمینان دارید؟
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelLoading}
                className="text-xl text-gray-400 hover:text-gray-700 disabled:opacity-50">
                ×
              </button>
            </div>

            {cancelError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {cancelError}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                دلیل لغو
              </label>

              <textarea
                value={cancellationReason}
                onChange={(event) => setCancellationReason(event.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="در صورت نیاز دلیل لغو ارجاع را وارد کنید..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              />

              <div className="mt-1 text-left text-xs text-gray-400">
                {cancellationReason.length}/2000
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                انصراف
              </button>

              <button
                type="button"
                onClick={handleCancelReferral}
                disabled={cancelLoading}
                className="rounded-lg bg-gray-700 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
                {cancelLoading ? "در حال لغو..." : "🚫 تأیید لغو"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-slate-400">{label}</span>

      <span className="text-left text-sm font-bold text-slate-700">
        {value}
      </span>
    </div>
  )
}

function InfoBox({ title, value, icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>

      <div>
        <div className="text-xs text-slate-400">{title}</div>

        <div className="mt-1 font-bold text-slate-800">{value}</div>
      </div>
    </div>
  )
}
