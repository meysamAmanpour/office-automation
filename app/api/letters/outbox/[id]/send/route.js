import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"
import { validate } from "@/helpers/validate"

import outboxService from "@/modules/letters/outbox/outbox.service"

import { validateSendDraft } from "@/modules/letters/outbox/outbox.validator"

export const POST = protectedRoute(
  {
    permissions: ["letters.send"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const data = await validate(request, validateSendDraft)

    const result = await outboxService.sendDraft(id, currentUser, data)

    return success(result, "نامه با موفقیت ارسال شد", 200)
  },
)
