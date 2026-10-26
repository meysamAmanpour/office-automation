import { z } from "zod"

export const createUserSchema = z.object({
  fullName: z.string().min(3, "نام کامل حداقل ۳ کاراکتر باشد"),

  username: z.string().min(3, "نام کاربری حداقل ۳ کاراکتر باشد"),

  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد"),

  role: z.enum(["SUPER_ADMIN", "ADMIN", "EMPLOYEE"]).optional(),

  companyId: z.string().min(1, "شرکت الزامی است"),

  departmentId: z.string().nullable().optional(),
})

export function validateCreateUser(data) {
  return createUserSchema.safeParse(data)
}

export const updateUserSchema = z.object({
  fullName: z.string().min(3).optional(),

  username: z.string().min(3).optional(),

  password: z.string().min(6).optional(),

  role: z.enum(["SUPER_ADMIN", "ADMIN", "EMPLOYEE"]).optional(),

  companyId: z.string().optional(),

  departmentId: z.string().nullable().optional(),

  isActive: z.boolean().optional(),
})

export function validateUpdateUser(data) {
  return updateUserSchema.safeParse(data)
}
