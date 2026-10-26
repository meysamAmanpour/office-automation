import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import letterRecipientService from "@/modules/letters/letter-recipient.service"

export const POST = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const recipient = await letterRecipientService.receiveLetter(
      id,
      currentUser.id,
    )

    return success(recipient, "نامه دریافت شد")
  },
)
