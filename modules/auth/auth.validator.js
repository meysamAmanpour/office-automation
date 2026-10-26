// import { z } from "zod"
// import ValidationError from "@/exceptions/ValidationError"

// export const loginSchema = z.object({
//   username: z.string().min(3, "نام کاربری حداقل ۳ کاراکتر باشد"),

//   password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد"),
// })

// export function validateLogin(data) {
//   const result = loginSchema.safeParse(data)

//   if (!result.success) {
//     throw new ValidationError(result.error.flatten().fieldErrors)
//   }

//   return result.data
// }
import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().min(3, "نام کاربری حداقل ۳ کاراکتر باشد"),

  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد"),
})

export function validateLogin(data) {
  return loginSchema.safeParse(data)
}
