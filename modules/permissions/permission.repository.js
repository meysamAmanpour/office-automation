import { prisma } from "@/lib/prisma"

class PermissionRepository {
  async findByName(name) {
    return prisma.permission.findUnique({
      where: {
        name,
      },
    })
  }

  async getRolePermissions(roleId) {
    return prisma.rolePermission.findMany({
      where: {
        roleId,
      },

      include: {
        permission: true,
      },
    })
  }

  async getAll() {
    return prisma.permission.findMany({
      orderBy: {
        name: "asc",
      },
    })
  }
}

export default new PermissionRepository()
