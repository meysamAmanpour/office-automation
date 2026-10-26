import { prisma } from "@/lib/prisma"
import BaseRepository from "@/lib/repositories/BaseRepository"

class DepartmentRepository extends BaseRepository {
  constructor() {
    super(prisma.department)
  }

  async findById(id) {
    return this.findOne({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        company: true,
      },
    })
  }

  async findByName(name, companyId) {
    return this.findOne({
      where: {
        name,
        companyId,
        isDeleted: false,
      },
    })
  }

  async getDepartments({ search, companyId, skip = 0, take = 10 }) {
    const where = {
      isDeleted: false,
    }

    if (companyId) {
      where.companyId = companyId
    }

    if (search) {
      where.name = {
        contains: search,
      }
    }

    const [departments, total] = await Promise.all([
      this.findAll({
        where,
        include: {
          company: true,
        },
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),

      this.count(where),
    ])

    return {
      departments,
      total,
    }
  }

  async findCompanyById(companyId) {
    return prisma.company.findFirst({
      where: {
        id: companyId,
        isDeleted: false,
      },
    })
  }

  async createDepartment(data) {
    return this.create(data)
  }

  async updateDepartment(id, data) {
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

  async countUsers(departmentId) {
    return prisma.user.count({
      where: {
        departmentId,
        isDeleted: false,
      },
    })
  }
}

export default new DepartmentRepository()
