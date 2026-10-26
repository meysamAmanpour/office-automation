import { z } from "zod"
import ValidationError from "@/exceptions/ValidationError"

export const loginSchema = z.object({
  username: z.string().trim().min(3, "نام کاربری حداقل ۳ کاراکتر باشد"),

  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد"),
})

export function validateLogin(data) {
  const result = loginSchema.safeParse(data)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    throw new ValidationError(errors)
  }

  return result.data
}
