import { success } from "@/helpers/apiResponse"

import protectedRoute from "@/helpers/auth/protectedRoute"

import { getPagination, getPaginationMeta } from "@/helpers/pagination"

import reportsService from "@/modules/reports/reports.service"

import {
  reportLetterDTO,
  reportSummaryDTO,
} from "@/modules/reports/reports.dto"

export const GET = protectedRoute(
  {
    permissions: ["reports.view"],
  },

  async (request, context, currentUser) => {
    const { searchParams } = new URL(request.url)

    const { page, limit, skip } = getPagination(searchParams)

    const search = searchParams.get("search") || ""

    const type = searchParams.get("type") || undefined

    const status = searchParams.get("status") || undefined

    const priority = searchParams.get("priority") || undefined

    const departmentId = searchParams.get("departmentId") || undefined

    const dateFrom = searchParams.get("dateFrom") || undefined

    const dateTo = searchParams.get("dateTo") || undefined

    const userRole = currentUser.roleRelation?.name

    const companyId =
      userRole === "SUPER_ADMIN"
        ? searchParams.get("companyId") || undefined
        : currentUser.companyId

    const filters = {
      companyId,
      departmentId,
      type,
      status,
      priority,
      search,
      dateFrom,
      dateTo,
      skip,
      take: limit,
    }

    const [result, summary] = await Promise.all([
      reportsService.getLettersReport(filters),

      reportsService.getLettersSummary({
        companyId,
        departmentId,
      }),
    ])

    return success(
      {
        summary: reportSummaryDTO(summary),

        items: result.letters.map(reportLetterDTO),
      },

      "گزارش نامه‌ها",

      200,

      getPaginationMeta(page, limit, result.total),
    )
  },
)
