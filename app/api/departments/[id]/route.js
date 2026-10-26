import { success, failure } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"
import { validate } from "@/helpers/validate"

import ForbiddenError from "@/exceptions/ForbiddenError"

import departmentService from "@/modules/departments/department.service"
import { departmentDTO } from "@/modules/departments/department.dto"
import { validateUpdateDepartment } from "@/modules/departments/department.validator"

export const GET = protectedRoute(
  {
    permissions: ["departments.read"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const department = await departmentService.getDepartment(id)

    if (!department) {
      return failure("دپارتمان پیدا نشد", 404)
    }

    const userRole = currentUser.roleRelation?.name

    // ADMIN فقط دپارتمان‌های شرکت خودش را ببیند
    if (
      userRole !== "SUPER_ADMIN" &&
      department.companyId !== currentUser.companyId
    ) {
      throw new ForbiddenError("عدم دسترسی به این دپارتمان")
    }

    return success(departmentDTO(department), "اطلاعات دپارتمان")
  },
)

export const PUT = protectedRoute(
  {
    permissions: ["departments.update"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const data = await validate(request, validateUpdateDepartment)

    const department = await departmentService.getDepartment(id)

    if (!department) {
      return failure("دپارتمان پیدا نشد", 404)
    }

    const userRole = currentUser.roleRelation?.name

    if (userRole === "ADMIN") {
      // ADMIN فقط دپارتمان شرکت خودش را ویرایش کند
      if (department.companyId !== currentUser.companyId) {
        throw new ForbiddenError("عدم دسترسی به این دپارتمان")
      }

      // ADMIN نباید بتواند دپارتمان را به شرکت دیگری منتقل کند
      delete data.companyId
    }

    const updatedDepartment = await departmentService.updateDepartment(id, data)

    return success(departmentDTO(updatedDepartment), "دپارتمان بروزرسانی شد")
  },
)

export const DELETE = protectedRoute(
  {
    permissions: ["departments.delete"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    const department = await departmentService.getDepartment(id)

    if (!department) {
      return failure("دپارتمان پیدا نشد", 404)
    }

    const userRole = currentUser.roleRelation?.name

    if (
      userRole !== "SUPER_ADMIN" &&
      department.companyId !== currentUser.companyId
    ) {
      throw new ForbiddenError("عدم دسترسی به این دپارتمان")
    }

    await departmentService.deleteDepartment(id)

    return success(null, "دپارتمان حذف شد")
  },
)
