"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

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

const referralStatusConfig = {
  PENDING: {
    label: "در انتظار دریافت",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  RECEIVED: {
    label: "دریافت شده",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  IN_PROGRESS: {
    label: "در حال بررسی",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  DONE: {
    label: "تکمیل شده",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "رد شده",
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  CANCELLED: {
    label: "لغو شده",
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
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date))
}

function StatusBadge({ status, referral = false }) {
  const config = referral ? referralStatusConfig[status] : statusConfig[status]

  if (!config) return null

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}>
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function PriorityBadge({ priority }) {
  const config = priorityConfig[priority]

  if (!config) return null

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-1 text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value || "-"}</div>
    </div>
  )
}

export default function IncomingLetterDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [letter, setLetter] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")

  const [referrals, setReferrals] = useState([])
  const [referralsLoading, setReferralsLoading] = useState(false)
  const [referralsError, setReferralsError] = useState("")
  const [referralActionLoading, setReferralActionLoading] = useState("")
  const [referralActionError, setReferralActionError] = useState("")

  const [referralModalOpen, setReferralModalOpen] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState(null)

  const [referralTargetType, setReferralTargetType] = useState("USER")
  const [referralTargetUserId, setReferralTargetUserId] = useState("")
  const [referralTargetDepartmentId, setReferralTargetDepartmentId] =
    useState("")
  const [referralDescription, setReferralDescription] = useState("")
  const [referralPriority, setReferralPriority] = useState("NORMAL")
  const [referralDueDate, setReferralDueDate] = useState("")

  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])

  const [referralCreateLoading, setReferralCreateLoading] = useState(false)
  const [referralCreateError, setReferralCreateError] = useState("")

  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [selectedCompleteReferral, setSelectedCompleteReferral] = useState(null)
  const [completionNote, setCompletionNote] = useState("")
  const [completeLoading, setCompleteLoading] = useState(false)
  const [completeError, setCompleteError] = useState("")

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedRejectReferral, setSelectedRejectReferral] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectLoading, setRejectLoading] = useState(false)
  const [rejectError, setRejectError] = useState("")

  const [attachments, setAttachments] = useState([])
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [attachmentsError, setAttachmentsError] = useState("")
  const [attachmentDownloadingId, setAttachmentDownloadingId] = useState("")

  const letterId = params?.id

  async function fetchLetter() {
    if (!letterId) return

    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/letters/incoming/${letterId}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "خطا در دریافت نامه")
      }

      setLetter(result.data)
    } catch (error) {
      console.error(error)
      setError(error.message || "خطا در دریافت نامه")
    } finally {
      setLoading(false)
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "خطا در دریافت اطلاعات کاربر")
      }

      setCurrentUser(result.data)
    } catch (error) {
      console.error("FETCH CURRENT USER ERROR:", error)
    }
  }

  async function fetchReferrals() {
    if (!letterId) return

    try {
      setReferralsLoading(true)
      setReferralsError("")

      const response = await fetch(`/api/letters/referrals/${letterId}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const contentType = response.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        const text = await response.text()

        console.error("NON JSON REFERRAL RESPONSE:", {
          status: response.status,
          url: response.url,
          text,
        })

        throw new Error(`پاسخ سرور JSON نیست. Status: ${response.status}`)
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "خطا در دریافت ارجاعات نامه")
      }

      setReferrals(Array.isArray(result.data) ? result.data : [])
    } catch (error) {
      console.error("FETCH REFERRALS ERROR:", error)
      setReferralsError(error.message || "خطا در دریافت ارجاعات نامه")
    } finally {
      setReferralsLoading(false)
    }
  }

  async function fetchAttachments() {
    if (!letterId) return

    try {
      setAttachmentsLoading(true)
      setAttachmentsError("")

      const response = await fetch(`/api/letters/${letterId}/attachments`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "خطا در دریافت فهرست پیوست‌ها")
      }

      setAttachments(Array.isArray(result.data) ? result.data : [])
    } catch (error) {
      console.error("FETCH ATTACHMENTS ERROR:", error)
      setAttachmentsError(error.message || "خطا در دریافت پیوست‌ها")
    } finally {
      setAttachmentsLoading(false)
    }
  }
  async function fetchReferralTargets() {
    try {
      const [usersResponse, departmentsResponse] = await Promise.all([
        fetch("/api/users?page=1&limit=100", {
          credentials: "include",
          cache: "no-store",
        }),

        fetch("/api/departments?page=1&limit=100", {
          credentials: "include",
          cache: "no-store",
        }),
      ])

      const usersContentType = usersResponse.headers.get("content-type") || ""

      const departmentsContentType =
        departmentsResponse.headers.get("content-type") || ""

      if (!usersContentType.includes("application/json")) {
        const text = await usersResponse.text()

        console.error("USERS NON JSON RESPONSE:", {
          status: usersResponse.status,
          text,
        })

        throw new Error(
          `پاسخ API کاربران JSON نیست. Status: ${usersResponse.status}`,
        )
      }

      if (!departmentsContentType.includes("application/json")) {
        const text = await departmentsResponse.text()

        console.error("DEPARTMENTS NON JSON RESPONSE:", {
          status: departmentsResponse.status,
          text,
        })

        throw new Error(
          `پاسخ API واحدها JSON نیست. Status: ${departmentsResponse.status}`,
        )
      }

      const usersResult = await usersResponse.json()
      const departmentsResult = await departmentsResponse.json()

      console.log("========== REFERRAL TARGETS ==========")
      console.log("USERS RESULT:", usersResult)
      console.log("DEPARTMENTS RESULT:", departmentsResult)

      if (usersResponse.ok && usersResult.success) {
        const usersData = usersResult.data

        const usersList = Array.isArray(usersData)
          ? usersData
          : Array.isArray(usersData?.records)
            ? usersData.records
            : Array.isArray(usersData?.items)
              ? usersData.items
              : []

        setUsers(usersList)
      } else {
        console.error("USERS API ERROR:", usersResult)

        setUsers([])
      }

      if (departmentsResponse.ok && departmentsResult.success) {
        const departmentsData = departmentsResult.data

        const departmentsList = Array.isArray(departmentsData)
          ? departmentsData
          : Array.isArray(departmentsData?.records)
            ? departmentsData.records
            : Array.isArray(departmentsData?.items)
              ? departmentsData.items
              : []

        setDepartments(departmentsList)
      } else {
        console.error("DEPARTMENTS API ERROR:", departmentsResult)

        setDepartments([])
      }
    } catch (error) {
      console.error("FETCH REFERRAL TARGETS ERROR:", error)

      setUsers([])
      setDepartments([])
    }
  }

  function openCompleteReferralModal(referral) {
    setSelectedCompleteReferral(referral)
    setCompletionNote("")
    setCompleteError("")
    setCompleteModalOpen(true)
  }

  function openReferralModal(referral) {
    setSelectedReferral(referral)

    setReferralTargetType("USER")
    setReferralTargetUserId("")
    setReferralTargetDepartmentId("")
    setReferralDescription("")
    setReferralPriority("NORMAL")
    setReferralDueDate("")
    setReferralCreateError("")

    setReferralModalOpen(true)
  }

  function openRejectReferralModal(referral) {
    setSelectedRejectReferral(referral)
    setRejectionReason("")
    setRejectError("")
    setRejectModalOpen(true)
  }

  async function handleCreateReferral() {
    try {
      setReferralCreateLoading(true)
      setReferralCreateError("")

      const payload = {
        letterId,
        targetType: referralTargetType,
        targetUserId:
          referralTargetType === "USER" ? referralTargetUserId : null,
        targetDepartmentId:
          referralTargetType === "DEPARTMENT"
            ? referralTargetDepartmentId
            : null,

        // ⭐ حفظ زنجیره ارجاع
        parentId: selectedReferral?.id || null,

        description: referralDescription || null,
        priority: referralPriority,
        dueDate: referralDueDate
          ? new Date(referralDueDate).toISOString()
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

      const contentType = response.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        const text = await response.text()

        console.error("NON JSON CREATE REFERRAL RESPONSE:", {
          status: response.status,
          url: response.url,
          text,
        })

        throw new Error(`پاسخ سرور JSON نیست. Status: ${response.status}`)
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "ایجاد ارجاع با خطا مواجه شد")
      }

      setReferralModalOpen(false)

      await fetchReferrals()
    } catch (error) {
      console.error("CREATE REFERRAL ERROR:", error)

      setReferralCreateError(error.message || "ایجاد ارجاع با خطا مواجه شد")
    } finally {
      setReferralCreateLoading(false)
    }
  }

  async function handleCompleteReferral() {
    if (!selectedCompleteReferral) return

    try {
      setCompleteLoading(true)
      setCompleteError("")

      const response = await fetch(
        `/api/letters/referrals/${selectedCompleteReferral.id}/complete`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completionNote: completionNote || null,
          }),
        },
      )

      const contentType = response.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        const text = await response.text()

        console.error("COMPLETE REFERRAL NON JSON RESPONSE:", {
          status: response.status,
          text,
        })

        throw new Error(`پاسخ سرور JSON نیست. Status: ${response.status}`)
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "تکمیل ارجاع با خطا مواجه شد")
      }

      setCompleteModalOpen(false)
      setSelectedCompleteReferral(null)
      setCompletionNote("")

      await fetchReferrals()
    } catch (error) {
      console.error("COMPLETE REFERRAL ERROR:", error)

      setCompleteError(error.message || "تکمیل ارجاع با خطا مواجه شد")
    } finally {
      setCompleteLoading(false)
    }
  }

  async function handleRejectReferral() {
    if (!selectedRejectReferral) return

    try {
      setRejectLoading(true)
      setRejectError("")

      const response = await fetch(
        `/api/letters/referrals/${selectedRejectReferral.id}/reject`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: rejectionReason || null,
          }),
        },
      )

      const contentType = response.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        const text = await response.text()

        console.error("REJECT REFERRAL NON JSON RESPONSE:", {
          status: response.status,
          text,
        })

        throw new Error(`پاسخ سرور JSON نیست. Status: ${response.status}`)
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "رد ارجاع با خطا مواجه شد")
      }

      setRejectModalOpen(false)
      setSelectedRejectReferral(null)
      setRejectionReason("")

      await fetchReferrals()
    } catch (error) {
      console.error("REJECT REFERRAL ERROR:", error)

      setRejectError(error.message || "رد ارجاع با خطا مواجه شد")
    } finally {
      setRejectLoading(false)
    }
  }

  useEffect(() => {
    if (!letterId) return

    fetchLetter()
    fetchCurrentUser()
    fetchReferrals()
    fetchReferralTargets()
    fetchAttachments()
  }, [letterId])

  async function handleAction(action) {
    try {
      setActionLoading(action)
      setActionError("")

      const response = await fetch(
        `/api/letters/incoming/${letterId}/${action}`,
        {
          method: "POST",
          credentials: "include",
        },
      )

      const contentType = response.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        const text = await response.text()

        console.error("NON JSON RESPONSE:", {
          status: response.status,
          url: response.url,
          text,
        })

        throw new Error(`پاسخ سرور JSON نیست. Status: ${response.status}`)
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "عملیات با خطا مواجه شد")
      }

      await fetchLetter()
    } catch (error) {
      console.error(error)
      setActionError(error.message || "عملیات با خطا مواجه شد")
    } finally {
      setActionLoading("")
    }
  }

  async function handleReferralAction(referralId, action) {
    try {
      setReferralActionLoading(referralId)
      setReferralActionError("")

      const response = await fetch(
        `/api/letters/referrals/${referralId}/${action}`,
        {
          method: "POST",
          credentials: "include",
        },
      )

      const contentType = response.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        const text = await response.text()

        console.error("NON JSON REFERRAL ACTION RESPONSE:", {
          status: response.status,
          url: response.url,
          text,
        })

        throw new Error(`پاسخ سرور JSON نیست. Status: ${response.status}`)
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "عملیات ارجاع با خطا مواجه شد")
      }

      await fetchReferrals()
    } catch (error) {
      console.error("REFERRAL ACTION ERROR:", error)

      setReferralActionError(error.message || "عملیات ارجاع با خطا مواجه شد")
    } finally {
      setReferralActionLoading("")
    }
  }

  function renderActionButton() {
    if (!letter?.recipient) return null

    const status = letter.recipient.status

    if (status === "PENDING") {
      return (
        <button
          type="button"
          onClick={() => handleAction("receive")}
          disabled={actionLoading !== ""}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60">
          {actionLoading === "receive" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              در حال دریافت...
            </>
          ) : (
            <>📥 دریافت نامه</>
          )}
        </button>
      )
    }

    if (status === "RECEIVED") {
      return (
        <button
          type="button"
          onClick={() => handleAction("read")}
          disabled={actionLoading !== ""}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {actionLoading === "read" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              در حال ثبت...
            </>
          ) : (
            <>👁️ علامت‌گذاری به‌عنوان خوانده‌شده</>
          )}
        </button>
      )
    }

    if (status === "READ") {
      return (
        <button
          type="button"
          onClick={() => handleAction("archive")}
          disabled={actionLoading !== ""}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
          {actionLoading === "archive" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              در حال آرشیو...
            </>
          ) : (
            <>🗄️ بایگانی نامه</>
          )}
        </button>
      )
    }

    if (status === "ARCHIVED") {
      return (
        <span className="inline-flex items-center rounded-xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-600">
          🗄️ نامه بایگانی شده است
        </span>
      )
    }

    return null
  }

  const visibleReferrals = referrals.filter((referral) => {
    if (!currentUser) return false

    if (
      referral.targetType === "USER" &&
      referral.targetUserId === currentUser.id
    ) {
      return true
    }

    if (
      referral.targetType === "DEPARTMENT" &&
      referral.targetDepartmentId === currentUser.department?.id
    ) {
      return true
    }

    return false
  })

  function getReferralTarget(referral) {
    if (referral.targetType === "USER") {
      return referral.targetUser?.fullName || "کاربر"
    }

    if (referral.targetType === "DEPARTMENT") {
      return referral.targetDepartment?.name || "واحد"
    }

    return "-"
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          در حال دریافت اطلاعات نامه...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="mb-2 text-lg font-semibold">خطا در دریافت نامه</div>

          <div className="text-sm">{error}</div>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            بازگشت
          </button>
        </div>
      </div>
    )
  }

  if (!letter) {
    return null
  }

  const recipientStatus = letter.recipient?.status

  async function handleDownloadAttachment(attachment) {
    try {
      setAttachmentsError("")
      setAttachmentDownloadingId(attachment.id)

      const response = await fetch(
        `/api/letters/${letterId}/attachments/${attachment.id}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      )

      if (!response.ok) {
        let message = "دانلود فایل با خطا مواجه شد"

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

      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error("DOWNLOAD ATTACHMENT ERROR:", error)
      setAttachmentsError(error.message || "دانلود فایل با خطا مواجه شد")
    } finally {
      setAttachmentDownloadingId("")
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard" className="transition hover:text-blue-600">
          داشبورد
        </Link>

        <span>/</span>

        <Link
          href="/dashboard/letters/incoming"
          className="transition hover:text-blue-600">
          نامه‌های دریافتی
        </Link>

        <span>/</span>

        <span className="text-slate-800">جزئیات نامه</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 text-sm text-slate-500">
              جزئیات نامه دریافتی
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              {letter.subject}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={recipientStatus} />

              <PriorityBadge priority={letter.priority} />

              {letter.referenceNumber && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                  شماره: {letter.referenceNumber}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">{renderActionButton()}</div>
        </div>

        {actionError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Letter Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-slate-900">
              اطلاعات نامه
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem label="موضوع" value={letter.subject} />

              <InfoItem label="شماره نامه" value={letter.referenceNumber} />

              <InfoItem
                label="تاریخ ایجاد"
                value={formatDate(letter.createdAt)}
              />

              <InfoItem
                label="اولویت"
                value={
                  priorityConfig[letter.priority]?.label || letter.priority
                }
              />

              <InfoItem
                label="فرستنده"
                value={letter.creator?.fullName || letter.creator?.username}
              />

              <InfoItem label="واحد فرستنده" value={letter.department?.name} />
            </div>
          </div>

          {/* Letter Body */}
          {(recipientStatus === "READ" || recipientStatus === "ARCHIVED") && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-slate-900">
                متن نامه
              </h2>

              <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-8 text-slate-700">
                {letter.body || "متن نامه موجود نیست."}
              </div>
            </div>
          )}

          {/* Letter Attachments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  📎 فایل‌های پیوست نامه
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  فایل‌های ضمیمه‌شده به این نامه
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {attachments.length} فایل
              </span>
            </div>

            {attachmentsLoading ? (
              <div className="py-8 text-center text-sm text-slate-500">
                در حال دریافت فایل‌های پیوست...
              </div>
            ) : attachmentsError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p>{attachmentsError}</p>

                <button
                  type="button"
                  onClick={fetchAttachments}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700">
                  تلاش مجدد
                </button>
              </div>
            ) : attachments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <div className="mb-2 text-3xl">📂</div>

                <p className="font-medium text-slate-700">
                  فایلی برای این نامه ثبت نشده است
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  در صورت وجود پیوست، فایل‌ها در این بخش نمایش داده می‌شوند.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl">
                        📄
                      </div>

                      <div className="min-w-0">
                        <p className="break-all font-semibold text-slate-800">
                          {attachment.originalName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          حجم:{" "}
                          {Number.isFinite(attachment.size)
                            ? attachment.size < 1024 * 1024
                              ? `${(attachment.size / 1024).toFixed(1)} کیلوبایت`
                              : `${(attachment.size / (1024 * 1024)).toFixed(1)} مگابایت`
                            : "نامشخص"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          بارگذاری توسط:{" "}
                          {attachment.uploadedBy?.fullName || "کاربر"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          تاریخ:{" "}
                          {attachment.createdAt
                            ? new Date(attachment.createdAt).toLocaleDateString(
                                "fa-IR",
                              )
                            : "نامشخص"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadAttachment(attachment)}
                      disabled={attachmentDownloadingId === attachment.id}
                      className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {attachmentDownloadingId === attachment.id
                        ? "در حال دانلود..."
                        : "⬇️ دانلود فایل"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Referrals */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  📌 ارجاعات این نامه
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  ارجاع‌های ارسال‌شده به شما یا واحد شما
                </p>
              </div>

              {visibleReferrals.length > 0 && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {visibleReferrals.length} ارجاع
                </span>
              )}
            </div>

            {referralsLoading ? (
              <div className="flex items-center justify-center py-10 text-sm text-slate-500">
                <span className="ml-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                در حال دریافت ارجاعات...
              </div>
            ) : referralsError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {referralsError}
              </div>
            ) : visibleReferrals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <div className="mb-2 text-3xl">📭</div>

                <div className="text-sm font-medium text-slate-700">
                  ارجاع فعالی برای شما وجود ندارد
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  اگر ارجاعی به شما یا واحد شما ارسال شود، در این قسمت نمایش
                  داده می‌شود.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {referralActionError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {referralActionError}
                  </div>
                )}

                {visibleReferrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={referral.status} referral />

                          <PriorityBadge priority={referral.priority} />

                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                            {referral.targetType === "USER"
                              ? "ارجاع به کاربر"
                              : "ارجاع به واحد"}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <InfoItem
                            label="ارجاع‌دهنده"
                            value={
                              referral.sender?.fullName ||
                              referral.sender?.username
                            }
                          />

                          <InfoItem
                            label="گیرنده"
                            value={getReferralTarget(referral)}
                          />

                          <InfoItem
                            label="تاریخ ارجاع"
                            value={formatDate(referral.createdAt)}
                          />

                          <InfoItem
                            label="مهلت انجام"
                            value={formatDate(referral.dueDate)}
                          />
                        </div>
                      </div>
                      {(referral.status === "RECEIVED" ||
                        referral.status === "IN_PROGRESS") && (
                        <button
                          type="button"
                          onClick={() => openReferralModal(referral)}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-medium text-purple-700 transition hover:bg-purple-100">
                          ↗️ ارجاع مجدد
                        </button>
                      )}
                      {referral.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleReferralAction(referral.id, "receive")
                          }
                          disabled={referralActionLoading === referral.id}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                          {referralActionLoading === referral.id ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              در حال دریافت...
                            </>
                          ) : (
                            <>📥 دریافت ارجاع</>
                          )}
                        </button>
                      )}

                      {referral.status === "RECEIVED" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleReferralAction(referral.id, "start")
                          }
                          disabled={referralActionLoading === referral.id}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60">
                          {referralActionLoading === referral.id ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              در حال شروع بررسی...
                            </>
                          ) : (
                            <>🔎 شروع بررسی</>
                          )}
                        </button>
                      )}
                      {referral.status === "IN_PROGRESS" && (
                        <button
                          type="button"
                          onClick={() => openCompleteReferralModal(referral)}
                          disabled={referralActionLoading === referral.id}
                          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
                          {referralActionLoading === referral.id
                            ? "در حال پردازش..."
                            : "✅ تکمیل ارجاع"}
                        </button>
                      )}

                      {(referral.status === "PENDING" ||
                        referral.status === "RECEIVED") && (
                        <button
                          type="button"
                          onClick={() => openRejectReferralModal(referral)}
                          disabled={referralActionLoading === referral.id}
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                          ❌ رد ارجاع
                        </button>
                      )}
                    </div>

                    {referral.description && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-slate-500">
                          توضیحات ارجاع
                        </div>

                        <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {referral.description}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sender */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-slate-900">فرستنده</h2>

            <div className="space-y-4">
              <InfoItem
                label="نام"
                value={letter.creator?.fullName || letter.creator?.username}
              />

              <InfoItem label="نام کاربری" value={letter.creator?.username} />

              <InfoItem label="واحد" value={letter.department?.name} />
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-slate-900">
              وضعیت نامه
            </h2>

            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-500" />

                <div>
                  <div className="text-sm font-medium text-slate-800">
                    ارسال نامه
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {formatDate(letter.createdAt)}
                  </div>
                </div>
              </div>

              {letter.recipient?.receivedAt && (
                <div className="flex gap-3">
                  <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-500" />

                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      دریافت نامه
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {formatDate(letter.recipient.receivedAt)}
                    </div>
                  </div>
                </div>
              )}

              {letter.recipient?.readAt && (
                <div className="flex gap-3">
                  <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500" />

                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      مطالعه نامه
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {formatDate(letter.recipient.readAt)}
                    </div>
                  </div>
                </div>
              )}

              {letter.recipient?.archivedAt && (
                <div className="flex gap-3">
                  <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-slate-500" />

                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      بایگانی نامه
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {formatDate(letter.recipient.archivedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {referralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  ↗️ ارجاع مجدد نامه
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  این ارجاع به عنوان ادامه ارجاع فعلی ثبت خواهد شد.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReferralModalOpen(false)}
                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100">
                ✕
              </button>
            </div>

            <div className="space-y-5 p-6">
              {referralCreateError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {referralCreateError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  نوع گیرنده
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReferralTargetType("USER")
                      setReferralTargetDepartmentId("")
                    }}
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      referralTargetType === "USER"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}>
                    👤 کاربر
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReferralTargetType("DEPARTMENT")
                      setReferralTargetUserId("")
                    }}
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      referralTargetType === "DEPARTMENT"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}>
                    🏢 واحد
                  </button>
                </div>
              </div>

              {referralTargetType === "USER" ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    انتخاب کاربر
                  </label>

                  <select
                    value={referralTargetUserId}
                    onChange={(event) =>
                      setReferralTargetUserId(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500">
                    <option value="">انتخاب کاربر</option>

                    {users
                      .filter((user) => user.id !== currentUser?.id)
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName} - {user.username}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    انتخاب واحد
                  </label>

                  <select
                    value={referralTargetDepartmentId}
                    onChange={(event) =>
                      setReferralTargetDepartmentId(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500">
                    <option value="">انتخاب واحد</option>

                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  توضیحات
                </label>

                <textarea
                  value={referralDescription}
                  onChange={(event) =>
                    setReferralDescription(event.target.value)
                  }
                  rows={4}
                  maxLength={2000}
                  placeholder="توضیحات مربوط به ارجاع..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    اولویت
                  </label>

                  <select
                    value={referralPriority}
                    onChange={(event) =>
                      setReferralPriority(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500">
                    <option value="LOW">کم</option>
                    <option value="NORMAL">عادی</option>
                    <option value="HIGH">مهم</option>
                    <option value="URGENT">فوری</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    مهلت انجام
                  </label>

                  <input
                    type="datetime-local"
                    value={referralDueDate}
                    onChange={(event) => setReferralDueDate(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-6">
              <button
                type="button"
                onClick={() => setReferralModalOpen(false)}
                disabled={referralCreateLoading}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                انصراف
              </button>

              <button
                type="button"
                onClick={handleCreateReferral}
                disabled={
                  referralCreateLoading ||
                  (referralTargetType === "USER" && !referralTargetUserId) ||
                  (referralTargetType === "DEPARTMENT" &&
                    !referralTargetDepartmentId)
                }
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50">
                {referralCreateLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    در حال ثبت...
                  </>
                ) : (
                  <>↗️ ثبت ارجاع</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">تکمیل ارجاع</h2>

                <p className="mt-1 text-sm text-gray-500">
                  نتیجه بررسی ارجاع را ثبت کنید.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="text-xl text-gray-400 hover:text-gray-700">
                ×
              </button>
            </div>

            {completeError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {completeError}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                گزارش تکمیل
              </label>

              <textarea
                value={completionNote}
                onChange={(event) => setCompletionNote(event.target.value)}
                rows={6}
                maxLength={2000}
                placeholder="نتیجه بررسی و اقدامات انجام‌شده را وارد کنید..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <div className="mt-1 text-left text-xs text-gray-400">
                {completionNote.length}/2000
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                disabled={completeLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                انصراف
              </button>

              <button
                type="button"
                onClick={handleCompleteReferral}
                disabled={completeLoading}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
                {completeLoading ? "در حال ثبت..." : "✅ ثبت تکمیل"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">رد ارجاع</h2>

                <p className="mt-1 text-sm text-gray-500">
                  در صورت نیاز دلیل رد ارجاع را وارد کنید.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                disabled={rejectLoading}
                className="text-xl text-gray-400 hover:text-gray-700 disabled:opacity-50">
                ×
              </button>
            </div>

            {rejectError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {rejectError}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                دلیل رد ارجاع
              </label>

              <textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="دلیل رد ارجاع را وارد کنید..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

              <div className="mt-1 text-left text-xs text-gray-400">
                {rejectionReason.length}/2000
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                disabled={rejectLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                انصراف
              </button>

              <button
                type="button"
                onClick={handleRejectReferral}
                disabled={rejectLoading}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                {rejectLoading ? "در حال ثبت..." : "❌ ثبت رد ارجاع"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
