import { prisma } from "@/lib/prisma"

class InboxRepository {
  async getUserInbox({
    userId,
    companyId,
    search = "",
    status,
    skip = 0,
    take = 10,
  }) {
    const where = {
      userId,
      letter: {
        companyId,
        isDeleted: false,
      },
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.letter.OR = [
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
      prisma.letterRecipient.findMany({
        where,

        include: {
          letter: {
            include: {
              creator: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                },
              },
              department: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take,
      }),

      prisma.letterRecipient.count({
        where,
      }),
    ])

    return {
      items,
      total,
    }
  }
}

export default new InboxRepository()
