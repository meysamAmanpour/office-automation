import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import referralService from "@/modules/letters/referral.service"

export const POST = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, context, currentUser) => {
    const { id } = await context.params

    const referral = await referralService.startReferral(id, currentUser)

    return success(referral, "ارجاع با موفقیت وارد مرحله بررسی شد", 200)
  },
)
