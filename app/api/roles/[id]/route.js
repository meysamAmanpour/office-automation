import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import roleService from "@/modules/roles/role.service"
import { roleDTO } from "@/modules/roles/role.dto"

export const GET = protectedRoute(
  {
    roles: ["SUPER_ADMIN"],
  },

  async (request, { params }) => {
    const { id } = await params

    const role = await roleService.getRole(id)

    return success(roleDTO(role), "اطلاعات نقش", 200)
  },
)
