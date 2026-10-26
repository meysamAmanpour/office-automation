import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"
import referralService from "@/modules/letters/referral.service"

export const POST = protectedRoute(
  {
    permissions: ["letters.refer"],
  },

  async (request, context, currentUser) => {
    const { id } = await context.params

    const referral = await referralService.receiveReferral(id, currentUser)

    return success(referral, "ارجاع با موفقیت دریافت شد", 200)
  },
)
