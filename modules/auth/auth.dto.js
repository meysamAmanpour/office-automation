export function sanitizeUser(user) {
  return {
    id: user.id,

    fullName: user.fullName,

    username: user.username,

    role: user.roleRelation?.name ?? null,

    isActive: user.isActive,

    company: user.company
      ? {
          id: user.company.id,
          name: user.company.name,
        }
      : null,

    department: user.department
      ? {
          id: user.department.id,
          name: user.department.name,
        }
      : null,
  }
}
