export function auditLogDTO(log) {
  if (!log) {
    return null
  }

  return {
    id: log.id,

    action: log.action,

    entity: log.entity,

    entityId: log.entityId,

    description: log.description,

    metadata: log.metadata,

    user: log.user
      ? {
          id: log.user.id,
          fullName: log.user.fullName,
          username: log.user.username,
        }
      : null,

    company: log.company
      ? {
          id: log.company.id,
          name: log.company.name,
          code: log.company.code,
        }
      : null,

    createdAt: log.createdAt,
  }
}
