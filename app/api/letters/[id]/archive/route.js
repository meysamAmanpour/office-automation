import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import letterRecipientService from "@/modules/letters/letter-recipient.service"

export const POST = protectedRoute(
  {
    permissions: ["letters.archive"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const recipient = await letterRecipientService.archiveLetter(
      id,
      currentUser.id,
    )

    return success(recipient, "نامه با موفقیت بایگانی شد")
  },
)
