import { success } from "@/helpers/apiResponse"

import protectedRoute from "@/helpers/auth/protectedRoute"

import { validate } from "@/helpers/validate"

import letterService from "@/modules/letters/letter.service"

import { letterDTO } from "@/modules/letters/letter.dto"

import { validateSendLetter } from "@/modules/letters/letter.validator"

export const POST = protectedRoute(
  {
    permissions: ["letters.send"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const body = await validate(request, validateSendLetter)

    const letter = await letterService.sendLetter(
      id,
      body.recipients,
      currentUser,
    )

    return success(letterDTO(letter), "نامه با موفقیت ارسال شد")
  },
)
