import { prisma } from "@/lib/prisma"
import BaseRepository from "@/lib/repositories/BaseRepository"

class CompanyRepository extends BaseRepository {
  constructor() {
    super(prisma.company)
  }

  async findById(id) {
    return this.findOne({
      where: {
        id,
        isDeleted: false,
      },
    })
  }

  async findByCode(code) {
    return this.findUnique({
      where: {
        code,
      },
    })
  }

  async getCompanies({ search = "", skip = 0, take = 10 }) {
    const where = {
      isDeleted: false,
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
          },
        },
        {
          code: {
            contains: search,
          },
        },
      ]
    }

    const { items, total } = await this.paginate({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      companies: items,
      total,
    }
  }

  async createCompany(data) {
    return this.create(data)
  }

  async updateCompany(id, data) {
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

export default new CompanyRepository()
