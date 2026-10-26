import { z } from "zod"

export const syncPermissionsSchema = z.object({
  permissions: z.array(z.string().min(1)).default([]),
})

export function validateSyncPermissions(data) {
  return syncPermissionsSchema.safeParse(data)
}
