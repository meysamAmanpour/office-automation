import { prism } from "@/lib/prisma"
import ConflictError from "@/exceptions/ConflictError"
import roleRepository from "./role.repository"

class RoleService {
  async getRoles() {
    return roleRepository.getRoles()
  }

  async getRole(id) {
    const role = await roleRepository.getRoleById(id)

    if (!role) {
      throw new ConflictError("نقش پیدا نشد")
    }

    return role
  }

  async syncPermissions(roleId, permissionNames) {
    const role = await roleRepository.getRoleById(roleId)

    if (!role) {
      throw new ConflictError("نقش پیدا نشد")
    }

    if (!Array.isArray(permissionNames)) {
      throw new ConflictError("لیست دسترسی‌ها نامعتبر است")
    }

    const permissions = await prisma.permission.findMany({
      where: {
        name: {
          in: permissionNames,
        },
      },
    })

    if (permissions.length !== permissionNames.length) {
      throw new ConflictError("یک یا چند دسترسی معتبر نیست")
    }

    const permissionIds = permissions.map((permission) => permission.id)

    return roleRepository.syncPermissions(roleId, permissionIds)
  }
}

export default new RoleService()
