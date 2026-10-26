import { success } from "@/helpers/apiResponse"
import { validate } from "@/helpers/validate"
import { getPagination, getPaginationMeta } from "@/helpers/pagination"
import protectedRoute from "@/helpers/auth/protectedRoute"

import departmentService from "@/modules/departments/department.service"
import { departmentDTO } from "@/modules/departments/department.dto"
import { validateCreateDepartment } from "@/modules/departments/department.validator"

export const GET = protectedRoute(
  {
    permissions: ["departments.read"],
  },

  async (request, context, currentUser) => {
    const { searchParams } = new URL(request.url)

    const { page, limit, skip } = getPagination(searchParams)

    const search = searchParams.get("search") || ""

    const userRole = currentUser.roleRelation?.name

    const companyId =
      userRole === "SUPER_ADMIN" ? undefined : currentUser.companyId

    const result = await departmentService.getDepartments({
      page,
      limit,
      skip,
      search,
      companyId,
    })

    return success(
      result.departments.map(departmentDTO),
      "لیست دپارتمان‌ها",
      200,
      getPaginationMeta(page, limit, result.total),
    )
  },
)

export const POST = protectedRoute(
  {
    permissions: ["departments.create"],
  },

  async (request, context, currentUser) => {
    const body = await validate(request, validateCreateDepartment)

    const userRole = currentUser.roleRelation?.name

    if (userRole === "ADMIN") {
      body.companyId = currentUser.companyId
    }

    const department = await departmentService.createDepartment(body)

    return success(
      departmentDTO(department),
      "دپارتمان با موفقیت ایجاد شد",
      201,
    )
  },
)
