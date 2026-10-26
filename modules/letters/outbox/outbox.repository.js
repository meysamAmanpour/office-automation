import ConflictError from "@/exceptions/ConflictError"
import { prisma } from "@/lib/prisma"
import BaseRepository from "@/lib/repositories/BaseRepository"

class OutboxRepository extends BaseRepository {
  constructor() {
    super(prisma.letter)
  }

  async getUserOutbox({
    userId,
    companyId,
    search = "",
    status,
    priority,
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

  async getUserOutboxDetail(id, userId, companyId) {
    return this.findOne({
      where: {
        id,
        creatorId: userId,
        companyId,
        isDeleted: false,
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
    })
  }
  async getSummary({ userId, companyId }) {
    const where = {
      creatorId: userId,
      companyId,
      isDeleted: false,
    }

    const [total, draft, sent] = await Promise.all([
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
    ])

    return {
      total,
      draft,
      sent,
    }
  }

  async updateDraft(id, userId, companyId, data) {
    return this.update(
      {
        id,
        creatorId: userId,
        companyId,
        isDeleted: false,
        status: "DRAFT",
      },
      data,
    )
  }

  async deleteDraft(id, userId, companyId) {
    return this.update(
      {
        id,
        creatorId: userId,
        companyId,
        isDeleted: false,
        status: "DRAFT",
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
    )
  }

  async sendDraft({ letterId, userId, companyId, recipients }) {
    return prisma.$transaction(async (tx) => {
      const letter = await tx.letter.findFirst({
        where: {
          id: letterId,
          creatorId: userId,
          companyId,
          isDeleted: false,
          status: "DRAFT",
        },
      })

      if (!letter) {
        throw new ConflictError("نامه پیدا نشد")
      }

      const recipientData = recipients.map((recipient) => ({
        letterId,
        recipientType: recipient.type,
        userId: recipient.userId ?? null,
        departmentId: recipient.departmentId ?? null,
        companyId: recipient.companyId ?? null,
        status: "PENDING",
      }))

      await tx.letterRecipient.createMany({
        data: recipientData,
      })

      return tx.letter.update({
        where: {
          id: letterId,
        },

        data: {
          status: "SENT",
        },
      })
    })
  }

  async validateRecipients({ recipients, companyId }) {
    for (const recipient of recipients) {
      if (recipient.type === "USER") {
        const user = await prisma.user.findFirst({
          where: {
            id: recipient.userId,
            companyId,
            isDeleted: false,
            isActive: true,
          },
        })

        if (!user) {
          throw new ConflictError("کاربر گیرنده متعلق به شرکت شما نیست")
        }
      }

      if (recipient.type === "DEPARTMENT") {
        const department = await prisma.department.findFirst({
          where: {
            id: recipient.departmentId,
            companyId,
            isDeleted: false,
          },
        })

        if (!department) {
          throw new ConflictError("دپارتمان گیرنده متعلق به شرکت شما نیست")
        }
      }

      if (recipient.type === "COMPANY") {
        const company = await prisma.company.findFirst({
          where: {
            id: recipient.companyId,
            isDeleted: false,
            isActive: true,
          },
        })

        if (!company) {
          throw new ConflictError("شرکت گیرنده معتبر نیست")
        }
      }
    }

    return true
  }
}

export default new OutboxRepository()
