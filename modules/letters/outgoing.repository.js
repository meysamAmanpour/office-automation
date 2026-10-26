import { prisma } from "@/lib/prisma"

class OutgoingRepository {
  async getUserOutgoing({
    userId,
    companyId,
    search = "",
    status,
    skip = 0,
    take = 10,
  }) {
    const where = {
      creatorId: userId,

      companyId,

      isDeleted: false,
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        {
          subject: {
            contains: search,
          },
        },
        {
          letterNumber: {
            contains: search,
          },
        },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.letter.findMany({
        where,

        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },

          department: true,

          recipients: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                },
              },

              department: true,

              company: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take,
      }),

      prisma.letter.count({
        where,
      }),
    ])

    return {
      items,
      total,
    }
  }
}

export default new OutgoingRepository()
