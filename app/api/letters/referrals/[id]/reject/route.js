import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"
import ValidationError from "@/exceptions/ValidationError"

import referralService from "@/modules/letters/referral.service"
import { rejectReferralSchema } from "@/modules/letters/referral.validator"

export const POST = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, context, currentUser) => {
    const { id } = await context.params

    const body = await request.json()

    const result = rejectReferralSchema.safeParse(body)

    if (!result.success) {
      throw new ValidationError(
        "اطلاعات رد ارجاع نامعتبر است",
        result.error.flatten(),
      )
    }

    const referral = await referralService.rejectReferral(
      id,
      currentUser,
      result.data.reason,
    )

    return success(referral, "ارجاع با موفقیت رد شد", 200)
  },
)
