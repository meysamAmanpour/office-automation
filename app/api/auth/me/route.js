import { cookies } from "next/headers"

import { verifyToken } from "@/lib/jwt"

import { getMe } from "@/modules/auth/auth.service"

import { success, failure } from "@/helpers/apiResponse"

export async function GET() {
  try {
    const cookieStore = await cookies()

    const token = cookieStore.get("token")?.value

    if (!token) {
      return failure("احراز هویت انجام نشده", 401)
    }

    const payload = verifyToken(token)

    const user = await getMe(payload.id)

    return success(user, "اطلاعات کاربر")
  } catch (error) {
    return failure(error.message, error.status || 401)
  }
}
