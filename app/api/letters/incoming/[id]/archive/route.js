import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import incomingService from "@/modules/letters/incoming.service"

export const POST = protectedRoute(
  {
    permissions: ["letters.archive"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const recipient = await incomingService.archiveLetter(id, currentUser)

    return success(recipient, "نامه با موفقیت آرشیو شد")
  },
)
