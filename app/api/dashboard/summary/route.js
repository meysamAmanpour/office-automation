import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import dashboardService from "@/modules/dashboard/dashboard.service"
import { dashboardDTO } from "@/modules/dashboard/dashboard.dto"

export const GET = protectedRoute(
  {
    permissions: ["dashboard.view"],
  },

  async (request, context, currentUser) => {
    const userRole = currentUser.roleRelation?.name

    const result = await dashboardService.getSummary({
      userRole,
      companyId: currentUser.companyId,
    })

    return success(dashboardDTO(result), "خلاصه داشبورد", 200)
  },
)
