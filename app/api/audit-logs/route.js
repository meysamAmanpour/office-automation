import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import { getPagination, getPaginationMeta } from "@/helpers/pagination"

import auditLogService from "@/modules/audit-logs/audit-log.service"
import { auditLogDTO } from "@/modules/audit-logs/audit-log.dto"

export const GET = protectedRoute(
  {
    permissions: ["audit-logs.read"],
  },

  async (request, context, currentUser) => {
    const { searchParams } = new URL(request.url)

    const { page, limit, skip } = getPagination(searchParams)

    const search = searchParams.get("search") || ""
    const action = searchParams.get("action") || undefined
    const entity = searchParams.get("entity") || undefined
    const userId = searchParams.get("userId") || undefined

    const result = await auditLogService.getLogs({
      currentUser,
      userId,
      action,
      entity,
      search,
      skip,
      take: limit,
    })

    return success(
      result.items.map(auditLogDTO),
      "گزارش فعالیت‌ها",
      200,
      getPaginationMeta(page, limit, result.total),
    )
  },
)
