import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import outboxService from "@/modules/letters/outbox/outbox.service"

export const GET = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, {}, currentUser) => {
    const summary = await outboxService.getSummary(currentUser)

    return success(summary, "خلاصه نامه‌های ارسالی", 200)
  },
)
