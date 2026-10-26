import { prisma } from "@/lib/prisma"

class DashboardRepository {
  async getLetterSummary({ companyId } = {}) {
    const letterWhere = {
      isDeleted: false,
      ...(companyId ? { companyId } : {}),
    }

    const recipientWhere = {
      ...(companyId ? { companyId } : {}),
      letter: {
        isDeleted: false,
        ...(companyId ? { companyId } : {}),
      },
    }

    const [total, draft, sent, pending, received, read, archived] =
      await Promise.all([
        prisma.letter.count({
          where: letterWhere,
        }),

        prisma.letter.count({
          where: {
            ...letterWhere,
            status: "DRAFT",
          },
        }),

        prisma.letter.count({
          where: {
            ...letterWhere,
            status: "SENT",
          },
        }),

        prisma.letterRecipient.count({
          where: {
            ...recipientWhere,
            status: "PENDING",
          },
        }),

        prisma.letterRecipient.count({
          where: {
            ...recipientWhere,
            status: "RECEIVED",
          },
        }),

        prisma.letterRecipient.count({
          where: {
            ...recipientWhere,
            status: "READ",
          },
        }),

        prisma.letterRecipient.count({
          where: {
            ...recipientWhere,
            status: "ARCHIVED",
          },
        }),
      ])

    return {
      letters: {
        total,
        draft,
        sent,
      },

      recipients: {
        pending,
        received,
        read,
        archived,
      },
    }
  }

  async getUserSummary({ companyId } = {}) {
    const where = {
      isDeleted: false,
      ...(companyId ? { companyId } : {}),
    }

    const [total, active] = await Promise.all([
      prisma.user.count({
        where,
      }),

      prisma.user.count({
        where: {
          ...where,
          isActive: true,
        },
      }),
    ])

    return {
      total,
      active,
    }
  }

  async getDepartmentCount({ companyId } = {}) {
    const total = await prisma.department.count({
      where: {
        isDeleted: false,
        ...(companyId ? { companyId } : {}),
      },
    })

    return {
      total,
    }
  }

  async getCompanyCount() {
    const total = await prisma.company.count({
      where: {
        isDeleted: false,
      },
    })

    return {
      total,
    }
  }
}

export default new DashboardRepository()
