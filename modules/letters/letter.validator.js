import { z } from "zod"

export const createLetterSchema = z.object({
  letterNumber: z.string().optional(),

  subject: z.string().min(3, "موضوع نامه حداقل ۳ کاراکتر باشد"),

  body: z.string().optional(),

  type: z.enum(["INCOMING", "OUTGOING", "INTERNAL"]),

  status: z.enum(["DRAFT", "SENT", "RECEIVED", "ARCHIVED"]).optional(),

  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),

  departmentId: z.string().nullable().optional(),

  senderName: z.string().optional(),

  senderOrganization: z.string().optional(),

  receiverName: z.string().optional(),

  receiverOrganization: z.string().optional(),
})

export function validateCreateLetter(data) {
  return createLetterSchema.safeParse(data)
}

export const updateLetterSchema = z.object({
  letterNumber: z.string().optional(),

  subject: z.string().min(3, "موضوع نامه حداقل ۳ کاراکتر باشد").optional(),

  body: z.string().optional(),

  type: z.enum(["INCOMING", "OUTGOING", "INTERNAL"]).optional(),

  status: z.enum(["DRAFT", "SENT", "RECEIVED", "ARCHIVED"]).optional(),

  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),

  departmentId: z.string().nullable().optional(),

  senderName: z.string().optional(),

  senderOrganization: z.string().optional(),

  receiverName: z.string().optional(),

  receiverOrganization: z.string().optional(),
})

export function validateUpdateLetter(data) {
  return updateLetterSchema.safeParse(data)
}

export const sendLetterSchema = z.object({
  recipients: z
    .array(
      z.object({
        type: z.enum(["USER", "DEPARTMENT", "COMPANY"]),

        userId: z.string().optional(),

        departmentId: z.string().optional(),

        companyId: z.string().optional(),
      }),
    )
    .min(1, "حداقل یک گیرنده باید انتخاب شود"),
})

export function validateSendLetter(data) {
  return sendLetterSchema.safeParse(data)
}
