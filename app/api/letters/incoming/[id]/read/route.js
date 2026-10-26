import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

import incomingService from "@/modules/letters/incoming.service"

export const POST = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const recipient = await incomingService.readLetter(id, currentUser)

    return success(recipient, "نامه خوانده شد")
  },
)
