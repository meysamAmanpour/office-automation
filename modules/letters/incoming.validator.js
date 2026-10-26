import { z } from "zod"

export const incomingQueryValidator = z.object({
  search: z.string().optional(),

  status: z.enum(["PENDING", "RECEIVED", "READ", "ARCHIVED"]).optional(),
})
