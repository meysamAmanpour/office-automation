import { prisma } from "@/lib/prisma"

class IncomingRepository {
  async getUserIncoming({
    userId,
    companyId,
    departmentId,
    search = "",
    status,
    priority,
    skip = 0,
    take = 10,
  }) {
    const recipientWhere = {
      OR: [
        {
          recipientType: "USER",
          userId,
        },

        ...(departmentId
          ? [
              {
                recipientType: "DEPARTMENT",
                departmentId,
              },
            ]
          : []),

        {
          recipientType: "COMPANY",
          companyId,
        },
      ],
    }

    if (status) {
      if (status === "READ") {
        recipientWhere.status = {
          in: ["READ", "ARCHIVED"],
        }
      } else {
        recipientWhere.status = status
      }
    }

    const referralWhere = {
      status: {
        in: ["PENDING", "RECEIVED", "IN_PROGRESS"],
      },

      OR: [
        {
          targetType: "USER",
          targetUserId: userId,
        },

        ...(departmentId
          ? [
              {
                targetType: "DEPARTMENT",
                targetDepartmentId: departmentId,
              },
            ]
          : []),
      ],
    }

    const where = {
      isDeleted: false,

      OR: [
        {
          recipients: {
            some: recipientWhere,
          },
        },

        {
          referrals: {
            some: referralWhere,
          },
        },
      ],
    }

    if (priority) {
      where.priority = priority
    }

    if (search) {
      where.AND = [
        {
          OR: [
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
          ],
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
            where: recipientWhere,

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

          referrals: {
            where: referralWhere,

            include: {
              sender: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                },
              },

              targetUser: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                },
              },

              targetDepartment: true,
            },

            orderBy: {
              createdAt: "desc",
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
  async getUserIncomingDetail({ letterId, userId, companyId, departmentId }) {
    const recipientWhere = {
      OR: [
        {
          recipientType: "USER",
          userId,
        },

        ...(departmentId
          ? [
              {
                recipientType: "DEPARTMENT",
                departmentId,
              },
            ]
          : []),

        {
          recipientType: "COMPANY",
          companyId,
        },
      ],
    }

    const referralWhere = {
      status: {
        in: ["PENDING", "RECEIVED", "IN_PROGRESS"],
      },

      OR: [
        {
          targetType: "USER",
          targetUserId: userId,
        },

        ...(departmentId
          ? [
              {
                targetType: "DEPARTMENT",
                targetDepartmentId: departmentId,
              },
            ]
          : []),
      ],
    }

    return prisma.letter.findFirst({
      where: {
        id: letterId,
        isDeleted: false,

        OR: [
          {
            recipients: {
              some: recipientWhere,
            },
          },

          {
            referrals: {
              some: referralWhere,
            },
          },
        ],
      },

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
          where: recipientWhere,

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

        referrals: {
          where: referralWhere,

          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },

            targetUser: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },

            targetDepartment: true,

            parent: {
              select: {
                id: true,
                senderId: true,
                targetType: true,
                targetUserId: true,
                targetDepartmentId: true,
                status: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
  }

  async receiveLetter({ letterId, userId, companyId, departmentId }) {
    const recipient = await prisma.letterRecipient.findFirst({
      where: {
        letterId,

        status: "PENDING",

        OR: [
          {
            recipientType: "USER",
            userId,
          },

          ...(departmentId
            ? [
                {
                  recipientType: "DEPARTMENT",
                  departmentId,
                },
              ]
            : []),

          {
            recipientType: "COMPANY",
            companyId,
          },
        ],
      },
    })

    if (!recipient) {
      return null
    }

    return prisma.letterRecipient.update({
      where: {
        id: recipient.id,
      },

      data: {
        status: "RECEIVED",

        receivedAt: new Date(),
      },
    })
  }
  async readLetter({ letterId, userId, companyId, departmentId }) {
    const recipient = await prisma.letterRecipient.findFirst({
      where: {
        letterId,

        status: "RECEIVED",

        OR: [
          {
            recipientType: "USER",
            userId,
          },

          ...(departmentId
            ? [
                {
                  recipientType: "DEPARTMENT",
                  departmentId,
                },
              ]
            : []),

          {
            recipientType: "COMPANY",
            companyId,
          },
        ],
      },
    })

    if (!recipient) {
      return null
    }

    return prisma.letterRecipient.update({
      where: {
        id: recipient.id,
      },

      data: {
        status: "READ",
        readAt: new Date(),
      },
    })
  }
  async archiveLetter({ letterId, userId, companyId, departmentId }) {
    const recipient = await prisma.letterRecipient.findFirst({
      where: {
        letterId,

        status: "READ",

        OR: [
          {
            recipientType: "USER",
            userId,
          },

          ...(departmentId
            ? [
                {
                  recipientType: "DEPARTMENT",
                  departmentId,
                },
              ]
            : []),

          {
            recipientType: "COMPANY",
            companyId,
          },
        ],
      },
    })

    if (!recipient) {
      return null
    }

    return prisma.letterRecipient.update({
      where: {
        id: recipient.id,
      },

      data: {
        status: "ARCHIVED",
      },
    })
  }
  async getUnreadCount({ userId, companyId, departmentId }) {
    const where = {
      status: {
        in: ["PENDING", "RECEIVED"],
      },

      OR: [
        {
          recipientType: "USER",
          userId,
        },

        ...(departmentId
          ? [
              {
                recipientType: "DEPARTMENT",
                departmentId,
              },
            ]
          : []),

        {
          recipientType: "COMPANY",
          companyId,
        },
      ],

      letter: {
        isDeleted: false,
      },
    }

    return prisma.letterRecipient.count({
      where,
    })
  }
  async getSummary({ userId, companyId, departmentId }) {
    const recipientScope = {
      OR: [
        {
          recipientType: "USER",
          userId,
        },

        ...(departmentId
          ? [
              {
                recipientType: "DEPARTMENT",
                departmentId,
              },
            ]
          : []),

        {
          recipientType: "COMPANY",
          companyId,
        },
      ],
    }

    const where = {
      letter: {
        isDeleted: false,
      },

      ...recipientScope,
    }

    const [unread, read, archived, total] = await Promise.all([
      prisma.letterRecipient.count({
        where: {
          ...where,
          status: {
            in: ["PENDING", "RECEIVED"],
          },
        },
      }),

      prisma.letterRecipient.count({
        where: {
          ...where,
          status: "READ",
        },
      }),

      prisma.letterRecipient.count({
        where: {
          ...where,
          status: "ARCHIVED",
        },
      }),

      prisma.letterRecipient.count({
        where,
      }),
    ])

    return {
      unread,
      read,
      archived,
      total,
    }
  }
}

export default new IncomingRepository()
