import { success } from "@/helpers/apiResponse"
import { validate } from "@/helpers/validate"
import protectedRoute from "@/helpers/auth/protectedRoute"

import roleService from "@/modules/roles/role.service"
import { roleDTO } from "@/modules/roles/role.dto"
import { validateSyncPermissions } from "@/modules/roles/role.validator"
import permissionService from "@/modules/permissions/permission.service"

export const GET = protectedRoute(
  {
    permissions: ["permissions.manage"],
  },

  async (request, { params }) => {
    const { id } = await params

    const role = await roleService.getRole(id)

    const permissions = await permissionService.getRolePermissions(role.name)

    return success(permissions, "دسترسی‌های نقش")
  },
)

export const PUT = protectedRoute(
  {
    roles: ["SUPER_ADMIN"],
  },

  async (request, { params }) => {
    const { id } = await params

    const body = await validate(request, validateSyncPermissions)

    const role = await roleService.syncPermissions(id, body.permissions)

    return success(roleDTO(role), "دسترسی‌های نقش بروزرسانی شد", 200)
  },
)
