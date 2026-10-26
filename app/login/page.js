"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "خطا در ورود")
      }

      router.push("/dashboard")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-100
      px-4
    ">
      <div
        className="
        w-full
        max-w-md
        bg-white
        rounded-2xl
        shadow-xl
        p-8
      ">
        <div className="text-center mb-8">
          <div
            className="
            mx-auto
            w-16
            h-16
            rounded-full
            bg-blue-600
            text-white
            flex
            items-center
            justify-center
            text-2xl
            font-bold
          ">
            A
          </div>

          <h1
            className="
            mt-4
            text-2xl
            font-bold
          ">
            اتوماسیون اداری
          </h1>

          <p
            className="
            text-gray-500
            mt-2
          ">
            ورود به پنل مدیریت
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className="
              block
              mb-2
              text-sm
            ">
              نام کاربری
            </label>

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
              placeholder="admin"
            />
          </div>

          <div>
            <label
              className="
              block
              mb-2
              text-sm
            ">
              رمز عبور
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
              placeholder="••••••"
            />
          </div>

          {error && (
            <div
              className="
                bg-red-100
                text-red-600
                p-3
                rounded-lg
                text-sm
              ">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="
              w-full
              bg-blue-600
              text-white
              py-3
              rounded-lg
              hover:bg-blue-700
              transition
              disabled:opacity-50
            ">
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      </div>
    </div>
  )
}
