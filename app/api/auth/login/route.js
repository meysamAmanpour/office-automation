import { login } from "@/modules/auth/auth.service"
import { validate } from "@/helpers/validate"
import { success, failure } from "@/helpers/apiResponse"

import { validateLogin } from "@/modules/auth/auth.validator"

import {
  checkRateLimit,
  recordFailure,
  resetRateLimit,
} from "@/helpers/security/rateLimiter"
// import { loginSchema } from "@/validators/auth.validator"

export async function POST(request) {
  try {
    // const body = validateLogin(await request.json())
    const body = await validate(request, validateLogin)

    const { username, password } = body

    const forwardedFor = request.headers.get("x-forwarded-for")

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const key = `${ip}:${username}`

    const rateLimit = checkRateLimit({
      key,
      maxAttempts: 5,
      windowMs: 60 * 1000,
    })

    if (!rateLimit.allowed) {
      const response = failure(
        "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.",
        429,
      )

      response.headers.set("Retry-After", String(rateLimit.retryAfter))

      return response
    }

    let result

    try {
      result = await login(username, password)
    } catch (error) {
      recordFailure({
        key,
        maxAttempts: 5,
        windowMs: 60 * 1000,
      })

      throw error
    }

    // Login موفق
    resetRateLimit(key)

    const response = success(
      {
        id: result.user.id,
        fullName: result.user.fullName,
        role: result.user.role,
      },
      "ورود موفق",
    )

    response.cookies.set("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    return failure(error.message, error.status || 500)
  }
}
