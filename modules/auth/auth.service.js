import bcrypt from "bcrypt"
import permissionService from "@/modules/permissions/permission.service"
import { findUserByUsername } from "./auth.repository"
import { findUserById } from "./auth.repository"
import { generateToken } from "@/lib/jwt"
import { sanitizeUser } from "./auth.dto"

import UnauthorizedError from "@/exceptions/AuthError"
import { auditLog } from "@/helpers/audit/auditLogger"

export async function login(username, password) {
  const user = await findUserByUsername(username)

  if (!user) {
    await auditLog({
      currentUser: null,
      action: "LOGIN_FAILED",
      entity: "AUTH",
      entityId: null,
      description: "تلاش ناموفق برای ورود",
      metadata: {
        username,
        reason: "USER_NOT_FOUND",
      },
    })

    throw new UnauthorizedError("نام کاربری یا رمز عبور اشتباه است")
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    await auditLog({
      currentUser: null,
      action: "LOGIN_FAILED",
      entity: "AUTH",
      entityId: user.id,
      description: "تلاش ناموفق برای ورود",
      metadata: {
        username: user.username,
        companyId: user.companyId,
        reason: "INVALID_PASSWORD",
      },
    })

    throw new UnauthorizedError("نام کاربری یا رمز عبور اشتباه است")
  }

  const token = generateToken({
    id: user.id,
    role: user.roleRelation?.name ?? null,
    companyId: user.companyId,
  })

  await auditLog({
    currentUser: {
      id: user.id,
      companyId: user.companyId,
    },
    action: "LOGIN",
    entity: "AUTH",
    entityId: user.id,
    description: "ورود موفق به سیستم",
    metadata: {
      username: user.username,
      companyId: user.companyId,
      role: user.roleRelation?.name ?? null,
    },
  })

  return {
    token,
    user: sanitizeUser(user),
  }
}

export async function getMe(userId) {
  const user = await findUserById(userId)

  if (!user) {
    throw new UnauthorizedError("کاربر یافت نشد")
  }

  const sanitizedUser = sanitizeUser(user)

  const permissions = await permissionService.getRolePermissions(
    user.roleRelation?.name,
  )

  return {
    ...sanitizedUser,
    permissions,
  }
}
