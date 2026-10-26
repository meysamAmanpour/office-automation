import { prisma } from "@/lib/prisma"

class AuditLogRepository {
  async create(data) {
    return prisma.auditLog.create({
      data,
    })
  }

  async findById(id) {
    return prisma.auditLog.findUnique({
      where: {
        id,
      },

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },

        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })
  }

  async getLogs({
    companyId,
    userId,
    action,
    entity,
    search = "",
    skip = 0,
    take = 10,
  }) {
    const where = {}

    if (companyId) {
      where.companyId = companyId
    }

    if (userId) {
      where.userId = userId
    }

    if (action) {
      where.action = action
    }

    if (entity) {
      where.entity = entity
    }

    if (search) {
      where.OR = [
        {
          action: {
            contains: search,
          },
        },
        {
          entity: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,

        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },

          company: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take,
      }),

      prisma.auditLog.count({
        where,
      }),
    ])

    return {
      items,
      total,
    }
  }
}

export default new AuditLogRepository()
