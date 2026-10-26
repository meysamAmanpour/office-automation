import { prisma } from "@/lib/prisma"

class ReferralRepository {
  async create(data) {
    return prisma.letterReferral.create({
      data,
      include: {
        letter: {
          select: {
            id: true,
            subject: true,
            letterNumber: true,
          },
        },

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

        targetDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async findById(id) {
    return prisma.letterReferral.findUnique({
      where: {
        id,
      },

      include: {
        letter: {
          select: {
            id: true,
            subject: true,
            letterNumber: true,
          },
        },

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

        targetDepartment: {
          select: {
            id: true,
            name: true,
          },
        },

        parent: {
          select: {
            id: true,
            status: true,
            senderId: true,
            targetType: true,
            targetUserId: true,
            targetDepartmentId: true,
            createdAt: true,
            completedAt: true,
          },
        },

        children: {
          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            status: true,
            senderId: true,
            targetType: true,
            targetUserId: true,
            targetDepartmentId: true,
            description: true,
            priority: true,
            dueDate: true,
            receivedAt: true,
            startedAt: true,
            completedAt: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async findManyByLetter(letterId) {
    return prisma.letterReferral.findMany({
      where: {
        letterId,
      },

      orderBy: {
        createdAt: "asc",
      },

      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            username: true,
            companyId: true,
          },
        },

        targetUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
            companyId: true,
          },
        },

        targetDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async findChainByLetter(letterId) {
    const referrals = await prisma.letterReferral.findMany({
      where: {
        letterId,
      },
      // ...
    })

    console.log(
      "🔴 FOUND REFERRALS:",
      referrals.map((r) => ({
        id: r.id,
        letterId: r.letterId,
      })),
    )
    return prisma.letterReferral.findMany({
      where: {
        letterId,
      },

      orderBy: {
        createdAt: "asc",
      },

      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            username: true,
            companyId: true,
          },
        },

        targetUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
            companyId: true,
          },
        },

        targetDepartment: {
          select: {
            id: true,
            name: true,
            companyId: true,
          },
        },

        parent: {
          select: {
            id: true,
          },
        },

        children: {
          select: {
            id: true,
          },
        },
      },
    })
  }

  async updateStatus(id, data) {
    return prisma.letterReferral.update({
      where: {
        id,
      },

      data,

      include: {
        letter: {
          select: {
            id: true,
            subject: true,
            letterNumber: true,
          },
        },

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

        targetDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  // async reject(id, reason) {
  //   return prisma.letterReferral.update({
  //     where: { id },
  //     data: {
  //       status: "REJECTED",
  //       rejectionReason: reason || null,
  //     },
  //     include: {
  //       letter: {
  //         select: {
  //           id: true,
  //           subject: true,
  //           letterNumber: true,
  //         },
  //       },
  //       sender: {
  //         select: {
  //           id: true,
  //           fullName: true,
  //           username: true,
  //         },
  //       },
  //       targetUser: {
  //         select: {
  //           id: true,
  //           fullName: true,
  //           username: true,
  //         },
  //       },
  //       targetDepartment: {
  //         select: {
  //           id: true,
  //           name: true,
  //         },
  //       },
  //     },
  //   })
  // }
}

export default new ReferralRepository()
