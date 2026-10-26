import { z } from "zod"

export const createReferralSchema = z
  .object({
    letterId: z.string().min(1, "شناسه نامه الزامی است"),

    targetType: z.enum(["USER", "DEPARTMENT"], {
      message: "نوع گیرنده ارجاع نامعتبر است",
    }),

    targetUserId: z
      .string()
      .min(1, "شناسه کاربر الزامی است")
      .optional()
      .nullable(),

    targetDepartmentId: z
      .string()
      .min(1, "شناسه واحد الزامی است")
      .optional()
      .nullable(),

    parentId: z
      .string()
      .min(1, "شناسه ارجاع قبلی نامعتبر است")
      .optional()
      .nullable(),

    description: z
      .string()
      .max(2000, "توضیحات نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد")
      .optional()
      .nullable(),

    priority: z
      .enum(["LOW", "NORMAL", "HIGH", "URGENT"], {
        message: "اولویت نامعتبر است",
      })
      .default("NORMAL"),

    dueDate: z.coerce.date().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.targetType === "USER") {
      if (!data.targetUserId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetUserId"],
          message: "برای ارجاع به کاربر، شناسه کاربر الزامی است",
        })
      }

      if (data.targetDepartmentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetDepartmentId"],
          message: "برای ارجاع به کاربر، واحد نباید مشخص شود",
        })
      }
    }

    if (data.targetType === "DEPARTMENT") {
      if (!data.targetDepartmentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetDepartmentId"],
          message: "برای ارجاع به واحد، شناسه واحد الزامی است",
        })
      }

      if (data.targetUserId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetUserId"],
          message: "برای ارجاع به واحد، کاربر نباید مشخص شود",
        })
      }
    }
  })

export const completeReferralSchema = z.object({
  completionNote: z
    .string()
    .max(2000, "گزارش تکمیل نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد")
    .optional()
    .nullable(),
})

export const rejectReferralSchema = z.object({
  reason: z
    .string()
    .max(2000, "دلیل رد ارجاع نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد")
    .optional()
    .nullable(),
})

export const cancelReferralSchema = z.object({
  reason: z
    .string()
    .max(2000, "دلیل لغو ارجاع نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد")
    .optional()
    .nullable(),
})
