import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import referralService from "@/modules/letters/referral.service"

export const GET = protectedRoute(
  {
    permissions: ["letters.refer"],
  },

  async (request, context, currentUser) => {
    const params = await context.params
    const letterId = params?.id

    console.log("🟢 ROUTE LETTER ID:", letterId)

    if (!letterId) {
      return success([], "شناسه نامه برای دریافت زنجیره ارجاع الزامی است", 400)
    }

    const referrals = await referralService.getReferralChain(
      letterId,
      currentUser,
    )

    return success(referrals, "زنجیره ارجاع‌های نامه", 200)
  },
)
