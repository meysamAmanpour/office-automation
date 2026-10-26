import { success, failure } from "@/helpers/apiResponse"

import { validate } from "@/helpers/validate"

import protectedRoute from "@/helpers/auth/protectedRoute"

import ValidationError from "@/exceptions/ValidationError"

import userService from "@/modules/users/user.service"

import { userDTO } from "@/modules/users/user.dto"

import { validateUpdateUser } from "@/modules/users/user.validator"
import ForbiddenError from "@/exceptions/ForbiddenError"

export const GET = protectedRoute(
  {
    roles: ["SUPER_ADMIN", "ADMIN"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const user = await userService.getUser(id)

    if (!user) {
      return failure("کاربر پیدا نشد", 404)
    }

    const currentUserRole = currentUser.roleRelation?.name

    // ADMIN فقط کاربران شرکت خودش را مشاهده کند
    if (
      currentUserRole === "ADMIN" &&
      user.companyId !== currentUser.companyId
    ) {
      throw new ForbiddenError("عدم دسترسی به این کاربر")
    }

    return success(userDTO(user), "اطلاعات کاربر")
  },
)
export const PUT = protectedRoute(
  {
    permissions: ["users.update"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const body = await validate(request, validateUpdateUser)

    const targetUser = await userService.getUser(id)

    if (!targetUser) {
      throw new ForbiddenError("کاربر یافت نشد")
    }

    const currentUserRole = currentUser.roleRelation?.name

    if (currentUserRole === "ADMIN") {
      // ADMIN فقط کاربران شرکت خودش را ویرایش کند
      if (targetUser.companyId !== currentUser.companyId) {
        throw new ForbiddenError("عدم دسترسی به این کاربر")
      }

      // ADMIN اجازه تغییر Role، شرکت و فعال/غیرفعال کردن را ندارد
      delete body.role
      delete body.companyId
      delete body.isActive
    }

    const user = await userService.updateUser(id, body, currentUser)

    return success(userDTO(user), "کاربر بروزرسانی شد")
  },
)

export const DELETE = protectedRoute(
  {
    permissions: ["users.delete"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    // جلوگیری از حذف حساب خودش
    if (currentUser.id === id) {
      throw new ValidationError("امکان حذف حساب کاربری خودتان وجود ندارد")
    }

    const targetUser = await userService.getUser(id)

    if (!targetUser) {
      throw new ValidationError("کاربر یافت نشد")
    }

    const currentUserRole = currentUser.roleRelation?.name

    // ADMIN فقط کاربران شرکت خودش را حذف کند
    if (currentUserRole === "ADMIN") {
      if (targetUser.companyId !== currentUser.companyId) {
        throw new ForbiddenError("عدم دسترسی به این کاربر")
      }
    }

    await userService.deleteUser(id, currentUser)

    return success(null, "کاربر حذف شد")
  },
)
