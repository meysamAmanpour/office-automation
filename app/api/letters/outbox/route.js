import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import outboxService from "@/modules/letters/outbox/outbox.service"

export const GET = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, {}, currentUser) => {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || undefined
    const priority = searchParams.get("priority") || undefined
    const page = Math.max(Number(searchParams.get("page")) || 1, 1)

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      100,
    )

    const skip = (page - 1) * limit

    const { items, total } = await outboxService.getUserOutbox({
      userId: currentUser.id,
      companyId: currentUser.companyId,
      search,
      status,
      priority,
      skip,
      take: limit,
    })

    return success(items, "نامه‌های ارسالی", 200, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    })
  },
)
