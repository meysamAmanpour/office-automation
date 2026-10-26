import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import roleService from "@/modules/roles/role.service"
import { roleDTO } from "@/modules/roles/role.dto"

export const GET = protectedRoute(
  {
    roles: ["SUPER_ADMIN"],
  },

  async () => {
    const roles = await roleService.getRoles()

    return success(roles.map(roleDTO), "لیست نقش‌ها", 200)
  },
)
