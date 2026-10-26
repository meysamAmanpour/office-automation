import { success } from "@/helpers/apiResponse"

import protectedRoute from "@/helpers/auth/protectedRoute"

import { getPagination, getPaginationMeta } from "@/helpers/pagination"

import incomingService from "@/modules/letters/incoming.service"

import { incomingDTO } from "@/modules/letters/incoming.dto"
import { validateQuery } from "@/helpers/validate"

import { incomingQueryValidator } from "@/modules/letters/incoming.validator"
export const GET = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, context, currentUser) => {
    const { searchParams } = new URL(request.url)

    const { page, limit, skip } = getPagination(searchParams)

    const query = validateQuery(searchParams, incomingQueryValidator)

    const priority = searchParams.get("priority") || undefined

    const search = query.search || ""

    const status = query.status

    const result = await incomingService.getUserIncoming({
      userId: currentUser.id,

      companyId: currentUser.companyId,

      departmentId: currentUser.departmentId || null,
      priority,
      search,

      status,

      skip,

      take: limit,
    })

    return success(
      result.items.map((letter) => incomingDTO(letter, currentUser)),

      "نامه‌های وارده",

      200,

      getPaginationMeta(page, limit, result.total),
    )
  },
)
