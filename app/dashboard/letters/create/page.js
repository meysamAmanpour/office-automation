"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateLetterPage() {
  const router = useRouter()

  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [priority, setPriority] = useState("NORMAL")

  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [companies, setCompanies] = useState([])

  const [selectedRecipients, setSelectedRecipients] = useState([])

  const [search, setSearch] = useState("")
  const [recipientType, setRecipientType] = useState("USER")

  const [loading, setLoading] = useState(false)
  const [loadingRecipients, setLoadingRecipients] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    loadRecipients()
  }, [])

  async function loadRecipients() {
    try {
      setLoadingRecipients(true)

      const [usersRes, departmentsRes, companiesRes] = await Promise.all([
        fetch("/api/users?page=1&limit=100"),
        fetch("/api/departments?page=1&limit=100"),
        fetch("/api/companies?page=1&limit=100"),
      ])

      const usersData = await usersRes.json()
      const departmentsData = await departmentsRes.json()
      const companiesData = await companiesRes.json()

      if (usersData.success) {
        setUsers(usersData.data || [])
      }

      if (departmentsData.success) {
        setDepartments(departmentsData.data || [])
      }

      if (companiesData.success) {
        setCompanies(companiesData.data || [])
      }
    } catch (error) {
      console.error(error)
      setError("خطا در دریافت گیرندگان")
    } finally {
      setLoadingRecipients(false)
    }
  }

  const recipientItems = useMemo(() => {
    if (recipientType === "USER") {
      return users.map((user) => ({
        id: user.id,
        name: user.fullName || user.username,
        subtitle: user.username,
      }))
    }

    if (recipientType === "DEPARTMENT") {
      return departments.map((department) => ({
        id: department.id,
        name: department.name,
        subtitle: "",
      }))
    }

    return companies.map((company) => ({
      id: company.id,
      name: company.name,
      subtitle: company.code,
    }))
  }, [recipientType, users, departments, companies])

  const filteredRecipients = useMemo(() => {
    const value = search.trim().toLowerCase()

    if (!value) return recipientItems

    return recipientItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(value) ||
        item.subtitle?.toLowerCase().includes(value),
    )
  }, [recipientItems, search])

  function addRecipient(item) {
    const exists = selectedRecipients.some(
      (recipient) =>
        recipient.type === recipientType && recipient.id === item.id,
    )

    if (exists) return

    setSelectedRecipients((prev) => [
      ...prev,
      {
        type: recipientType,
        id: item.id,
        name: item.name,
        subtitle: item.subtitle,
      },
    ])
  }

  function removeRecipient(index) {
    setSelectedRecipients((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError("")
    setSuccessMessage("")

    if (!subject.trim()) {
      setError("موضوع نامه را وارد کنید")
      return
    }

    if (!body.trim()) {
      setError("متن نامه را وارد کنید")
      return
    }

    if (!selectedRecipients.length) {
      setError("حداقل یک گیرنده انتخاب کنید")
      return
    }

    try {
      setLoading(true)

      const recipients = selectedRecipients.map((recipient) => {
        if (recipient.type === "USER") {
          return {
            type: "USER",
            userId: recipient.id,
          }
        }

        if (recipient.type === "DEPARTMENT") {
          return {
            type: "DEPARTMENT",
            departmentId: recipient.id,
          }
        }

        return {
          type: "COMPANY",
          companyId: recipient.id,
        }
      })

      const response = await fetch("/api/letters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "OUTGOING",
          subject: subject.trim(),
          body: body.trim(),
          priority,
          recipients,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "ایجاد نامه با خطا مواجه شد")
      }

      setSuccessMessage("نامه با موفقیت ایجاد شد")

      const letterId = result.data?.id

      if (letterId) {
        setTimeout(() => {
          router.push(`/dashboard/letters/drafts/${letterId}`)
        }, 500)
      } else {
        setTimeout(() => {
          router.push("/dashboard/letters/drafts")
        }, 500)
      }
    } catch (error) {
      console.error(error)
      setError(error.message || "خطا در ایجاد نامه")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ایجاد نامه جدید</h1>

          <p className="mt-1 text-sm text-gray-500">
            اطلاعات نامه و گیرندگان را وارد کنید
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          بازگشت
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">اطلاعات نامه</h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                موضوع نامه
              </label>

              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="موضوع نامه را وارد کنید"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                اولویت
              </label>

              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="LOW">کم</option>
                <option value="NORMAL">عادی</option>
                <option value="HIGH">بالا</option>
                <option value="URGENT">فوری</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                متن نامه
              </label>

              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="متن نامه را وارد کنید..."
                rows={12}
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            گیرندگان نامه
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => {
                setRecipientType("USER")
                setSearch("")
              }}
              className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                recipientType === "USER"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}>
              کاربر
            </button>

            <button
              type="button"
              onClick={() => {
                setRecipientType("DEPARTMENT")
                setSearch("")
              }}
              className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                recipientType === "DEPARTMENT"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}>
              واحد سازمانی
            </button>

            <button
              type="button"
              onClick={() => {
                setRecipientType("COMPANY")
                setSearch("")
              }}
              className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                recipientType === "COMPANY"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}>
              شرکت
            </button>
          </div>

          <div className="mt-5">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجوی گیرنده..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-gray-200">
            {loadingRecipients ? (
              <div className="p-6 text-center text-sm text-gray-500">
                در حال دریافت گیرندگان...
              </div>
            ) : filteredRecipients.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                گیرنده‌ای پیدا نشد
              </div>
            ) : (
              filteredRecipients.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addRecipient(item)}
                  className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-right last:border-b-0 hover:bg-gray-50">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>

                    {item.subtitle && (
                      <div className="mt-1 text-xs text-gray-500">
                        {item.subtitle}
                      </div>
                    )}
                  </div>

                  <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    افزودن
                  </span>
                </button>
              ))
            )}
          </div>

          {selectedRecipients.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                گیرندگان انتخاب‌شده
              </h3>

              <div className="space-y-2">
                {selectedRecipients.map((recipient, index) => (
                  <div
                    key={`${recipient.type}-${recipient.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {recipient.name}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {recipient.type === "USER"
                          ? "کاربر"
                          : recipient.type === "DEPARTMENT"
                            ? "واحد سازمانی"
                            : "شرکت"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeRecipient(index)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/letters/drafts")}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            انصراف
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "در حال ایجاد..." : "ایجاد نامه"}
          </button>
        </div>
      </form>
    </div>
  )
}
