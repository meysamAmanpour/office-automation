import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"
import { permissionDTO } from "@/modules/permissions/permission.dto"

import permissionService from "@/modules/permissions/permission.service"

export const GET = protectedRoute(
  {
    permissions: ["permissions.manage"],
  },

  async () => {
    const permissions = await permissionService.getAllPermissions()

    return success(permissions.map(permissionDTO), "لیست دسترسی‌ها")
  },
)
