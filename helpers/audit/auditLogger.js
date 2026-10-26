import auditLogService from "@/modules/audit-logs/audit-log.service"

export async function auditLog({
  currentUser,
  action,
  entity = null,
  entityId = null,
  description = null,
  metadata = null,
}) {
  return auditLogService.createLog({
    userId: currentUser?.id || null,
    companyId: currentUser?.companyId || null,
    action,
    entity,
    entityId,
    description,
    metadata,
  })
}
