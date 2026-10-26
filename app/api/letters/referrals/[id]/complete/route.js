import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import ValidationError from "@/exceptions/ValidationError"

import referralService from "@/modules/letters/referral.service"
import { completeReferralSchema } from "@/modules/letters/referral.validator"

export const POST = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, context, currentUser) => {
    const { id } = await context.params

    const body = await request.json()

    const result = completeReferralSchema.safeParse(body)

    if (!result.success) {
      throw new ValidationError(
        "اطلاعات تکمیل ارجاع نامعتبر است",
        result.error.flatten(),
      )
    }

    const referral = await referralService.completeReferral(
      id,
      currentUser,
      result.data.completionNote,
    )

    return success(referral, "ارجاع با موفقیت تکمیل شد", 200)
  },
)
