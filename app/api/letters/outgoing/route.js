import { success } from "@/helpers/apiResponse"

import protectedRoute from "@/helpers/auth/protectedRoute"

import { getPagination, getPaginationMeta } from "@/helpers/pagination"

import outgoingService from "@/modules/letters/outgoing.service"

import { outgoingDTO } from "@/modules/letters/outgoing.dto"

export const GET = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, context, currentUser) => {
    const { searchParams } = new URL(request.url)

    const { page, limit, skip } = getPagination(searchParams)

    const search = searchParams.get("search") || ""

    const status = searchParams.get("status") || undefined

    const result = await outgoingService.getUserOutgoing({
      userId: currentUser.id,

      companyId: currentUser.companyId,

      search,

      status,

      skip,

      take: limit,
    })

    return success(
      result.items.map(outgoingDTO),

      "نامه‌های صادره",

      200,

      getPaginationMeta(page, limit, result.total),
    )
  },
)
