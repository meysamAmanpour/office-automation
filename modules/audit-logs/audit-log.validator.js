import { z } from "zod"

export const auditLogQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, "شماره صفحه باید حداقل ۱ باشد")
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1, "تعداد رکورد باید حداقل ۱ باشد")
    .max(100, "تعداد رکورد نمی‌تواند بیشتر از ۱۰۰ باشد")
    .default(10),

  userId: z.string().min(1, "شناسه کاربر نامعتبر است").optional(),

  action: z.string().min(1, "نوع عملیات نامعتبر است").optional(),

  entity: z.string().min(1, "نوع موجودیت نامعتبر است").optional(),

  search: z
    .string()
    .max(200, "عبارت جستجو نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
    .optional(),
})
