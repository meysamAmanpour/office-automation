"use client"

function formatDate(date) {
  if (!date) return "-"

  return new Date(date).toLocaleString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusInfo(status) {
  const statuses = {
    PENDING: {
      label: "در انتظار دریافت",
      icon: "⏳",
    },

    RECEIVED: {
      label: "دریافت شد",
      icon: "📥",
    },

    IN_PROGRESS: {
      label: "در حال بررسی",
      icon: "🔎",
    },

    DONE: {
      label: "تکمیل شد",
      icon: "✅",
    },

    REJECTED: {
      label: "رد شد",
      icon: "❌",
    },

    CANCELLED: {
      label: "لغو شد",
      icon: "🚫",
    },
  }

  return (
    statuses[status] || {
      label: status,
      icon: "•",
    }
  )
}

function getTargetName(referral) {
  if (referral.targetType === "USER") {
    return referral.targetUser?.fullName || "کاربر نامشخص"
  }

  if (referral.targetType === "DEPARTMENT") {
    return referral.targetDepartment?.name || "واحد نامشخص"
  }

  return "مقصد نامشخص"
}

function getTargetTypeLabel(type) {
  if (type === "USER") return "کاربر"

  if (type === "DEPARTMENT") return "واحد"

  return "نامشخص"
}

function ReferralCard({ referral, isLast, currenUser }) {
  const status = getStatusInfo(referral.status)

  return (
    <div className="relative flex gap-4">
      {!isLast && (
        <div className="absolute right-[15px] top-9 h-full w-px bg-gray-200" />
      )}

      {/* Timeline node */}
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-sm shadow-sm">
        {status.icon}
      </div>

      {/* Referral content */}
      <div className="mb-8 min-w-0 flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-800">
              {referral.sender?.fullName || "فرستنده نامشخص"}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              ارجاع به{" "}
              <span className="font-semibold text-gray-700">
                {getTargetName(referral)}
              </span>
              <span className="mr-2 rounded-md bg-white px-2 py-0.5 text-[11px] text-gray-500">
                {getTargetTypeLabel(referral.targetType)}
              </span>
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600">
            {status.label}
          </span>
        </div>

        {referral.description && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
            <p className="mb-1 text-xs font-medium text-gray-500">
              توضیحات ارجاع
            </p>

            <p className="text-sm leading-6 text-gray-700">
              {referral.description}
            </p>
          </div>
        )}

        <div className="mt-4 grid gap-3 text-xs text-gray-500 sm:grid-cols-2">
          <div>
            <span className="font-medium text-gray-600">ایجاد:</span>{" "}
            {formatDate(referral.createdAt)}
          </div>

          {referral.receivedAt && (
            <div>
              <span className="font-medium text-gray-600">دریافت:</span>{" "}
              {formatDate(referral.receivedAt)}
            </div>
          )}

          {referral.startedAt && (
            <div>
              <span className="font-medium text-gray-600">شروع بررسی:</span>{" "}
              {formatDate(referral.startedAt)}
            </div>
          )}

          {referral.completedAt && (
            <div>
              <span className="font-medium text-gray-600">تکمیل:</span>{" "}
              {formatDate(referral.completedAt)}
            </div>
          )}
        </div>

        {referral.completionNote && (
          <div className="mt-4 rounded-lg border border-green-100 bg-green-50 p-3">
            <p className="mb-1 text-xs font-medium text-green-700">
              گزارش تکمیل
            </p>

            <p className="text-sm leading-6 text-green-800">
              {referral.completionNote}
            </p>
          </div>
        )}

        {referral.rejectionReason && (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3">
            <p className="mb-1 text-xs font-medium text-red-700">دلیل رد</p>

            <p className="text-sm leading-6 text-red-800">
              {referral.rejectionReason}
            </p>
          </div>
        )}

        {referral.cancellationReason && (
          <div className="mt-4 rounded-lg border border-orange-100 bg-orange-50 p-3">
            <p className="mb-1 text-xs font-medium text-orange-700">دلیل لغو</p>

            <p className="text-sm leading-6 text-orange-800">
              {referral.cancellationReason}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReferralTimeline({ referrals = [], renderActions }) {
  if (!referrals.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <div className="mb-2 text-3xl">📭</div>

        <p className="text-sm text-gray-500">
          هنوز ارجاعی برای این نامه ثبت نشده است.
        </p>
      </div>
    )
  }

  /*
   * پیدا کردن اولین Referral زنجیره
   *
   * اولین Referral:
   * parent === null
   */
  const rootReferrals = referrals.filter((referral) => !referral.parent)

  /*
   * ساخت Map برای دسترسی سریع به Referralها
   */
  const referralMap = new Map(
    referrals.map((referral) => [referral.id, referral]),
  )

  function buildChain(root) {
    const chain = []

    let current = root

    while (current) {
      chain.push(current)

      const nextId = current.children?.[0]?.id

      if (!nextId) break

      current = referralMap.get(nextId)
    }

    return chain
  }

  const chains = rootReferrals.map(buildChain)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800">مسیر ارجاع نامه</h2>

        <p className="mt-1 text-sm text-gray-500">
          مسیر گردش، وضعیت و نتیجه ارجاع‌های نامه
        </p>
      </div>

      <div className="space-y-8">
        {chains.map((chain, chainIndex) => (
          <div key={chainIndex}>
            {chains.length > 1 && (
              <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                زنجیره ارجاع {chainIndex + 1}
              </div>
            )}

            {chain.map((referral, index) => (
              <div
                className="flex items-center justify-between"
                key={referral.id}>
                <ReferralCard
                  key={referral.id}
                  referral={referral}
                  isLast={index === chain.length - 1}
                />
                <div className="me-4 flex flex-wrap gap-2">
                  {renderActions && renderActions(referral)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
