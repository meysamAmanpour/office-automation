import { prisma } from "@/lib/prisma"
import BaseRepository from "@/lib/repositories/BaseRepository"

class LetterRepository extends BaseRepository {
  constructor() {
    super(prisma.letter)
  }

  async findById(id) {
    return this.findOne({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        company: true,
        department: true,
        creator: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
    })
  }

  async getLetters({
    search,
    type,
    status,
    priority,
    companyId,
    departmentId,
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
        {
          senderName: {
            contains: search,
          },
        },
        {
          receiverName: {
            contains: search,
          },
        },
      ]
    }

    const { items, total } = await this.paginate({
      where,
      include: {
        company: true,
        department: true,
        creator: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      letters: items,
      total,
    }
  }

  async createLetter(data) {
    return this.create(data)
  }

  async updateLetter(id, data) {
    return this.update(
      {
        id,
      },
      data,
    )
  }

  async findDepartmentById(id) {
    return prisma.department.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    })
  }

  async softDelete(id) {
    return this.update(
      {
        id,
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
    )
  }
}

export default new LetterRepository()
