import { prisma } from "@/lib/prisma"
import BaseRepository from "@/lib/repositories/BaseRepository"

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user)
  }

  async findById(id) {
    const user = await this.findOne({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        company: true,
        department: true,
        roleRelation: true,
      },
    })

    return user
  }

  async findByUsername(username) {
    return this.findUnique({
      where: {
        username,
      },
      include: {
        company: true,
        department: true,
        roleRelation: true,
      },
    })
  }

  async getUsers({ search, role, companyId, skip = 0, take = 10 }) {
    const where = {
      isDeleted: false,
    }

    if (companyId) {
      where.companyId = companyId
    }

    if (role) {
      where.roleRelation = {
        name: role,
      }
    }

    if (search) {
      where.OR = [
        {
          fullName: {
            contains: search,
          },
        },
        {
          username: {
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
        roleRelation: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      users: items,
      total,
    }
  }

  async createUser(data) {
    return this.create(data)
  }

  async findDepartmentById(id) {
    return prisma.department.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    })
  }

  async updateUser(id, data) {
    return this.update(
      {
        id,
      },
      data,
    )
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

export default new UserRepository()
