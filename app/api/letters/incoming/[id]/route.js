import { success } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"
import { incomingDTO } from "@/modules/letters/incoming.dto"
import incomingService from "@/modules/letters/incoming.service"

export const GET = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const letter = await incomingService.getUserIncomingDetail(id, currentUser)

    return success(incomingDTO(letter), "جزئیات نامه وارده", 200)
  },
)
