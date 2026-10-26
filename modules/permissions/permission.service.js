import { prisma } from "@/lib/prisma"
import permissionRepository from "./permission.repository"

class PermissionService {
  async hasPermission(roleName, permissionName) {
    const role = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
    })

    if (!role) {
      return false
    }

    const permissions = await permissionRepository.getRolePermissions(role.id)

    return permissions.some((item) => item.permission.name === permissionName)
  }

  async getRolePermissions(roleName) {
    const role = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
    })

    if (!role) {
      return []
    }

    const permissions = await permissionRepository.getRolePermissions(role.id)

    return permissions.map((item) => item.permission.name)
  }

  async getAllPermissions() {
    return permissionRepository.getAll()
  }
}

export default new PermissionService()
