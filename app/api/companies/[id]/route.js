import { success } from "@/helpers/apiResponse"

import protectedRoute from "@/helpers/auth/protectedRoute"

import companyService from "@/modules/companies/company.service"

import { companyDTO } from "@/modules/companies/company.dto"

import { validate } from "@/helpers/validate"

import { validateUpdateCompany } from "@/modules/companies/company.validator"

export const GET = protectedRoute(
  {
    permissions: ["companies.read"],
  },

  async (request, { params }) => {
    const { id } = await params

    const company = await companyService.getCompanyById(id)

    return success(companyDTO(company), "اطلاعات شرکت")
  },
)

export const PUT = protectedRoute(
  {
    permissions: ["companies.update"],
  },

  async (request, { params }, currentUser) => {
    const body = await validate(request, validateUpdateCompany)

    const { id } = await params

    const company = await companyService.updateCompany(id, body, currentUser)

    return success(companyDTO(company), "شرکت با موفقیت ویرایش شد")
  },
)

export const DELETE = protectedRoute(
  {
    permissions: ["companies.delete"],
  },

  async (request, { params }, currentUser) => {
    const { id } = await params

    await companyService.deleteCompany(id, currentUser)

    return success(null, "شرکت با موفقیت حذف شد")
  },
)
