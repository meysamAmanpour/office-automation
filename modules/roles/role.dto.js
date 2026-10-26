export function roleDTO(role) {
  return {
    id: role.id,

    name: role.name,

    description: role.description,

    permissions:
      role.rolePermissions?.map((item) => ({
        id: item.permission.id,
        name: item.permission.name,
        description: item.permission.description,
      })) || [],

    usersCount: role._count?.users || 0,

    createdAt: role.createdAt,
  }
}
