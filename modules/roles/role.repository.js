import { prisma } from "@/lib/prisma"

class RoleRepository {
  async getRoles() {
    return prisma.role.findMany({
      orderBy: {
        createdAt: "asc",
      },

      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },

        _count: {
          select: {
            users: true,
          },
        },
      },
    })
  }

  async getRoleById(id) {
    return prisma.role.findUnique({
      where: {
        id,
      },

      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },

        _count: {
          select: {
            users: true,
          },
        },
      },
    })
  }

  async syncPermissions(roleId, permissionIds) {
    return prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: {
          roleId,
        },
      })

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        })
      }

      return tx.role.findUnique({
        where: {
          id: roleId,
        },

        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },

          _count: {
            select: {
              users: true,
            },
          },
        },
      })
    })
  }
}

export default new RoleRepository()
