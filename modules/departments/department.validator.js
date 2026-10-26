import { z } from "zod"

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام دپارتمان باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام دپارتمان نباید بیشتر از ۱۰۰ کاراکتر باشد"),

  companyId: z.string().min(1, "شرکت الزامی است"),
})

export function validateCreateDepartment(data) {
  return createDepartmentSchema.safeParse(data)
}

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام دپارتمان باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام دپارتمان نباید بیشتر از ۱۰۰ کاراکتر باشد")
    .optional(),

  companyId: z.string().optional(),
})

export function validateUpdateDepartment(data) {
  return updateDepartmentSchema.safeParse(data)
}
