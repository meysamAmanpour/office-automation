import { z } from "zod"

export const validateUpdateDraft = (data) => {
  const schema = z.object({
    subject: z.string().min(1).optional(),

    body: z.string().optional(),

    type: z.enum(["INCOMING", "OUTGOING", "INTERNAL"]).optional(),

    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),

    departmentId: z.string().nullable().optional(),
  })

  return schema.safeParse(data)
}

export const validateSendDraft = (data) => {
  const schema = z.object({
    recipients: z
      .array(
        z.object({
          type: z.enum(["USER", "DEPARTMENT", "COMPANY"]),

          userId: z.string().optional(),

          departmentId: z.string().optional(),

          companyId: z.string().optional(),
        }),
      )
      .min(1),
  })

  return schema.safeParse(data)
}
