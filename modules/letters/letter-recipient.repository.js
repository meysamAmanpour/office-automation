import { prisma } from "@/lib/prisma"

class LetterRecipientRepository {
  async findUserById(id) {
    return prisma.user.findFirst({
      where: {
        id,
        isActive: true,
        isDeleted: false,
      },
    })
  }

  async findDepartmentById(id) {
    return prisma.department.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    })
  }

  async findCompanyById(id) {
    return prisma.company.findFirst({
      where: {
        id,
        isActive: true,
        isDeleted: false,
      },
    })
  }

  async createMany(data) {
    return prisma.letterRecipient.createMany({
      data,
    })
  }

  async findByLetterId(letterId) {
    return prisma.letterRecipient.findMany({
      where: {
        letterId,
      },
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
      orderBy: {
        createdAt: "asc",
      },
    })
  }

  async findById(id) {
    return prisma.letterRecipient.findUnique({
      where: {
        id,
      },
      include: {
        letter: true,
        user: true,
        department: true,
        company: true,
      },
    })
  }

  async updateStatus(id, status, data = {}) {
    return prisma.letterRecipient.update({
      where: {
        id,
      },
      data: {
        status,
        ...data,
      },
    })
  }

  async findUserRecipient(letterId, userId) {
    return prisma.letterRecipient.findFirst({
      where: {
        letterId,
        userId,
      },
      include: {
        letter: true,
      },
    })
  }

  async receive(id) {
    return prisma.letterRecipient.update({
      where: {
        id,
      },
      data: {
        status: "RECEIVED",
        receivedAt: new Date(),
      },
    })
  }

  async markAsRead(id) {
    return prisma.letterRecipient.update({
      where: {
        id,
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    })
  }
  async archive(id) {
    return prisma.letterRecipient.update({
      where: {
        id,
      },
      data: {
        status: "ARCHIVED",
      },
    })
  }
}

export default new LetterRecipientRepository()
