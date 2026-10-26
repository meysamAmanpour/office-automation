export function departmentDTO(department) {
  if (!department) return null

  return {
    id: department.id,

    name: department.name,

    company: department.company
      ? {
          id: department.company.id,
          name: department.company.name,
        }
      : null,

    createdAt: department.createdAt,
  }
}
