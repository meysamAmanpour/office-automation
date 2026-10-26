import { success } from "@/helpers/apiResponse"
import { validate } from "@/helpers/validate"
import { getPagination, getPaginationMeta } from "@/helpers/pagination"

import protectedRoute from "@/helpers/auth/protectedRoute"

import letterService from "@/modules/letters/letter.service"
import { letterDTO } from "@/modules/letters/letter.dto"

import { validateCreateLetter } from "@/modules/letters/letter.validator"

export const GET = protectedRoute(
  {
    permissions: ["letters.view"],
  },

  async (request, context, currentUser) => {
    const { searchParams } = new URL(request.url)

    const { page, limit, skip } = getPagination(searchParams)

    const search = searchParams.get("search") || ""

    const type = searchParams.get("type") || undefined

    const status = searchParams.get("status") || undefined

    const priority = searchParams.get("priority") || undefined

    const departmentId = searchParams.get("departmentId") || undefined

    const userRole = currentUser.roleRelation?.name

    // SUPER_ADMIN همه شرکت‌ها
    // سایر کاربران فقط شرکت خودشان
    const companyId =
      userRole === "SUPER_ADMIN" ? undefined : currentUser.companyId

    const result = await letterService.getLetters({
      page,
      limit,
      skip,
      search,
      type,
      status,
      priority,
      departmentId,
      companyId,
    })

    return success(
      result.letters.map(letterDTO),
      "لیست نامه‌ها",
      200,
      getPaginationMeta(page, limit, result.total),
    )
  },
)

export const POST = protectedRoute(
  {
    permissions: ["letters.create"],
  },

  async (request, context, currentUser) => {
    const body = await validate(request, validateCreateLetter)

    const letter = await letterService.createLetter(body, currentUser)

    return success(letterDTO(letter), "نامه با موفقیت ایجاد شد", 201)
  },
)
