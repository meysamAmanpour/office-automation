import { validate } from "@/helpers/validate"
import { success } from "@/helpers/apiResponse"
import { getPagination, getPaginationMeta } from "@/helpers/pagination"
import userService from "@/modules/users/user.service"
import { userDTO } from "@/modules/users/user.dto"
import { validateCreateUser } from "@/modules/users/user.validator"
import protectedRoute from "@/helpers/auth/protectedRoute"
export const GET = protectedRoute(
  {
    permissions: ["users.read"],
  },

  async (request, context, currentUser) => {
    const { searchParams } = new URL(request.url)

    const { page, limit, skip } = getPagination(searchParams)

    const search = searchParams.get("search") || ""

    const role = searchParams.get("role") || undefined

    const userRole = currentUser.roleRelation?.name

    const companyId =
      userRole === "SUPER_ADMIN" ? undefined : currentUser.companyId

    const result = await userService.getUsers({
      page,
      limit,
      skip,
      search,
      role,
      companyId,
    })

    return success(
      result.users.map(userDTO),

      "لیست کاربران",

      200,

      getPaginationMeta(
        page,

        limit,

        result.total,
      ),
    )
  },
)

export const POST = protectedRoute(
  {
    permissions: ["users.create"],
  },

  async (request, context, currentUser) => {
    const body = await validate(request, validateCreateUser)

    // محدودیت ADMIN
    const currentUserRole = currentUser.roleRelation?.name

    if (currentUserRole === "ADMIN") {
      body.companyId = currentUser.companyId

      if (body.role !== "EMPLOYEE") {
        body.role = "EMPLOYEE"
      }
    }

    const user = await userService.createUser(body, currentUser)

    return success(userDTO(user), "کاربر با موفقیت ایجاد شد", 201)
  },
)
