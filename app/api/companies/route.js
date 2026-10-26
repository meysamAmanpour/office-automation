import { success } from "@/helpers/apiResponse"

import asyncHandler from "@/helpers/asyncHandler"

import getCurrentUser from "@/helpers/auth/getCurrentUser"

import authorize from "@/helpers/auth/authorize"

import { getPagination, getPaginationMeta } from "@/helpers/pagination"

import companyService from "@/modules/companies/company.service"

import { companyDTO } from "@/modules/companies/company.dto"

import { validateCreateCompany } from "@/modules/companies/company.validator"
import { validate } from "@/helpers/validate"
import protectedRoute from "@/helpers/auth/protectedRoute"
export const GET = protectedRoute(
  {
    permissions: ["companies.read"],
  },

  async (request, context, currentUser) => {
    const { searchParams } = new URL(request.url)

    const { page, limit, skip } = getPagination(searchParams)

    const search = searchParams.get("search") || ""

    const result = await companyService.getCompanies({
      search,
      skip,
      take: limit,
    })

    return success(
      result.companies.map(companyDTO),

      "لیست شرکت‌ها",

      200,

      getPaginationMeta(page, limit, result.total),
    )
  },
)

export const POST = protectedRoute(
  {
    permissions: ["companies.create"],
  },

  async (request, context, currentUser) => {
    const body = await validate(request, validateCreateCompany)

    const company = await companyService.createCompany(body, currentUser)

    return success(companyDTO(company), "شرکت با موفقیت ایجاد شد", 201)
  },
)
