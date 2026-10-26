import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import auditLogService from "@/modules/audit-logs/audit-log.service"
import { auditLogDTO } from "@/modules/audit-logs/audit-log.dto"

export const GET = protectedRoute(
  {
    permissions: ["audit-logs.read"],
  },

  async (request, context, currentUser) => {
    const { id } = await context.params

    const log = await auditLogService.getLogById(id, currentUser)

    if (!log) {
      return success(null, "گزارش فعالیت پیدا نشد", 404)
    }

    return success(auditLogDTO(log), "جزئیات گزارش فعالیت", 200)
  },
)
