import permissionService from "@/modules/permissions/permission.service"

import ForbiddenError from "@/exceptions/ForbiddenError"

export default async function checkPermission(currentUser, permission) {
  if (!currentUser) {
    throw new ForbiddenError("کاربر احراز نشده است")
  }

  const roleName = currentUser.roleRelation?.name

  if (!roleName) {
    throw new ForbiddenError("نقش کاربر مشخص نیست")
  }

  const hasAccess = await permissionService.hasPermission(roleName, permission)

  if (!hasAccess) {
    throw new ForbiddenError("شما دسترسی لازم برای انجام این عملیات را ندارید")
  }

  return true
}
