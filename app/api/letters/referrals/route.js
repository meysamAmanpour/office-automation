import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"
import ValidationError from "@/exceptions/ValidationError"
import referralService from "@/modules/letters/referral.service"
import { createReferralSchema } from "@/modules/letters/referral.validator"

export const POST = protectedRoute(
  {
    permissions: ["letters.refer"],
  },

  async (request, context, currentUser) => {
    const body = await request.json()

    const result = createReferralSchema.safeParse(body)

    if (!result.success) {
      throw new ValidationError(
        "اطلاعات ارجاع نامه نامعتبر است",
        result.error.flatten(),
      )
    }

    const referral = await referralService.createReferral(
      result.data,
      currentUser,
    )

    return success(referral, "ارجاع نامه با موفقیت ثبت شد", 201)
  },
)
