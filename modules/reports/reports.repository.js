import { prisma } from "@/lib/prisma"

class ReportsRepository {
  async getLettersReport({
    companyId,
    departmentId,
    type,
    status,
    priority,
    search = "",
    dateFrom,
    dateTo,
    skip = 0,
    take = 10,
  }) {
    const where = {
      isDeleted: false,
    }

    if (companyId) {
      where.companyId = companyId
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
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

    if (dateFrom || dateTo) {
      where.createdAt = {}

      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }

      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)

        where.createdAt.lte = endDate
      }
    }

    const [letters, total] = await Promise.all([
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

          company: true,

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
      letters,
      total,
    }
  }

  async getLettersSummary({ companyId, departmentId }) {
    const where = {
      isDeleted: false,
    }

    if (companyId) {
      where.companyId = companyId
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    const [
      total,
      draft,
      sent,
      pendingRecipients,
      receivedRecipients,
      readRecipients,
      archivedRecipients,
    ] = await Promise.all([
      prisma.letter.count({
        where,
      }),

      prisma.letter.count({
        where: {
          ...where,
          status: "DRAFT",
        },
      }),

      prisma.letter.count({
        where: {
          ...where,
          status: "SENT",
        },
      }),

      prisma.letterRecipient.count({
        where: {
          status: "PENDING",
          letter: where,
        },
      }),

      prisma.letterRecipient.count({
        where: {
          status: "RECEIVED",
          letter: where,
        },
      }),

      prisma.letterRecipient.count({
        where: {
          status: "READ",
          letter: where,
        },
      }),

      prisma.letterRecipient.count({
        where: {
          status: "ARCHIVED",
          letter: where,
        },
      }),
    ])

    return {
      total,
      draft,
      sent,

      recipients: {
        pending: pendingRecipients,
        received: receivedRecipients,
        read: readRecipients,
        archived: archivedRecipients,
      },
    }
  }
}

export default new ReportsRepository()
