import { getToken } from "./getToken"

import { verifyToken } from "@/lib/jwt"

import AuthError from "@/exceptions/AuthError"

import userService from "@/modules/users/user.service"

export default async function getCurrentUser(request) {
  const token = getToken(request)
  console.log("TOKEN:", token)
  if (!token) {
    throw new AuthError("ابتدا وارد شوید")
  }

  const payload = verifyToken(token)

  if (!payload) {
    throw new AuthError("توکن نامعتبر است")
  }

  const user = await userService.getCurrentUser(payload.id)

  if (!user) {
    throw new AuthError("کاربر یافت نشد")
  }

  return user
}
