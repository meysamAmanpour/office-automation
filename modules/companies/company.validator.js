import { z } from "zod"

const createCompanySchema = z.object({
  name: z.string().min(2, "نام شرکت الزامی است"),

  code: z.string().min(2, "کد شرکت الزامی است"),
})

const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),

  code: z.string().min(2).optional(),

  isActive: z.boolean().optional(),
})

export function validateCreateCompany(data) {
  return createCompanySchema.safeParse(data)
}

export function validateUpdateCompany(data) {
  return updateCompanySchema.safeParse(data)
}
