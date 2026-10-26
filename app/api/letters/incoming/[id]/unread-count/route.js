import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import incomingService from "@/modules/letters/incoming.service"

export const GET = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, {}, currentUser) => {
    const count = await incomingService.getUnreadCount(currentUser)

    return success({ count }, "تعداد نامه‌های خوانده نشده")
  },
)
