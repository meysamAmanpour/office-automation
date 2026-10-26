import { success, failure } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"
import { validate } from "@/helpers/validate"

import outboxService from "@/modules/letters/outbox/outbox.service"
import { validateUpdateDraft } from "@/modules/letters/outbox/outbox.validator"
export const GET = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const letter = await outboxService.getUserOutboxDetail(
      id,
      currentUser.id,
      currentUser.companyId,
    )

    if (!letter) {
      return failure("نامه پیدا نشد", 404)
    }

    return success(letter, "جزئیات نامه ارسالی", 200)
  },
)
export const PUT = protectedRoute(
  {
    permissions: ["letters.create"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const data = await validate(request, validateUpdateDraft)

    const letter = await outboxService.updateDraft(id, currentUser, data)

    return success(letter, "پیش‌نویس با موفقیت بروزرسانی شد", 200)
  },
)

export const DELETE = protectedRoute(
  {
    permissions: ["letters.create"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const letter = await outboxService.deleteDraft(id, currentUser)

    return success(letter, "پیش‌نویس با موفقیت حذف شد", 200)
  },
)
