import { prisma } from "@/lib/prisma"
import ConflictError from "@/exceptions/ConflictError"
import userRepository from "./user.repository"
import bcrypt from "bcrypt"
import { auditLog } from "@/helpers/audit/auditLogger"
class UserService {
  async createUser(data, currentUser) {
    const existingUser = await userRepository.findByUsername(data.username)

    if (existingUser) {
      throw new ConflictError("این نام کاربری قبلاً ثبت شده است")
    }

    const role = await prisma.role.findUnique({
      where: {
        name: data.role || "EMPLOYEE",
      },
    })

    if (!role) {
      throw new ConflictError("نقش انتخاب شده یافت نشد")
    }

    if (data.departmentId) {
      const department = await userRepository.findDepartmentById(
        data.departmentId,
      )

      if (!department) {
        throw new ConflictError("دپارتمان پیدا نشد")
      }

      if (department.companyId !== data.companyId) {
        throw new ConflictError("دپارتمان انتخاب‌شده متعلق به این شرکت نیست")
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const { role: _, ...userData } = data

    const user = await userRepository.create({
      ...userData,
      roleId: role.id,
      password: hashedPassword,
    })

    await auditLog({
      currentUser,
      action: "CREATE",
      entity: "USER",
      entityId: user.id,
      description: "کاربر جدید ایجاد شد",
      metadata: {
        username: user.username,
        fullName: user.fullName,
        role: role.name,
        companyId: user.companyId,
        departmentId: user.departmentId,
      },
    })

    return user
  }

  async getUsers(filters) {
    return await userRepository.getUsers(filters)
  }

  async getUser(id) {
    return await userRepository.findById(id)
  }

  async getCurrentUser(id) {
    const user = await userRepository.findById(id)

    return user
  }

  async deleteUser(id, currentUser) {
    const user = await userRepository.findById(id)

    if (!user) {
      throw new ConflictError("کاربر پیدا نشد")
    }

    const result = await userRepository.softDelete(id)

    await auditLog({
      currentUser,
      action: "DELETE",
      entity: "USER",
      entityId: user.id,
      description: "کاربر حذف شد",
      metadata: {
        username: user.username,
        fullName: user.fullName,
        roleId: user.roleId,
        companyId: user.companyId,
      },
    })

    return result
  }
  async updateUser(id, data, currentUser) {
    const user = await userRepository.findById(id)

    if (!user) {
      throw new ConflictError("کاربر پیدا نشد")
    }

    const oldRoleId = user.roleId
    const oldCompanyId = user.companyId

    const companyId = data.companyId ?? user.companyId

    const departmentId =
      data.departmentId !== undefined ? data.departmentId : user.departmentId

    if (departmentId) {
      const department = await userRepository.findDepartmentById(departmentId)

      if (!department) {
        throw new ConflictError("دپارتمان پیدا نشد")
      }

      if (department.companyId !== companyId) {
        throw new ConflictError("دپارتمان انتخاب‌شده متعلق به این شرکت نیست")
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    if (data.role) {
      const role = await prisma.role.findUnique({
        where: {
          name: data.role,
        },
      })

      if (!role) {
        throw new ConflictError("نقش انتخاب شده یافت نشد")
      }

      data.roleId = role.id

      delete data.role
    }

    const updatedUser = await userRepository.updateUser(id, data)

    // تغییر نقش
    if (data.roleId !== undefined && data.roleId !== oldRoleId) {
      const [oldRole, newRole] = await Promise.all([
        oldRoleId
          ? prisma.role.findUnique({
              where: {
                id: oldRoleId,
              },
            })
          : null,

        data.roleId
          ? prisma.role.findUnique({
              where: {
                id: data.roleId,
              },
            })
          : null,
      ])

      await auditLog({
        currentUser,
        action: "ROLE_CHANGE",
        entity: "USER",
        entityId: user.id,
        description: "نقش کاربر تغییر کرد",
        metadata: {
          before: {
            role: oldRole?.name ?? null,
          },
          after: {
            role: newRole?.name ?? null,
          },
        },
      })
    }

    // تغییر شرکت
    if (data.companyId !== undefined && data.companyId !== oldCompanyId) {
      await auditLog({
        currentUser,
        action: "COMPANY_CHANGE",
        entity: "USER",
        entityId: user.id,
        description: "شرکت کاربر تغییر کرد",
        metadata: {
          before: {
            companyId: oldCompanyId,
          },
          after: {
            companyId: data.companyId,
          },
        },
      })
    }

    // تغییرات عادی
    const hasRoleChange = data.roleId !== undefined && data.roleId !== oldRoleId

    const hasCompanyChange =
      data.companyId !== undefined && data.companyId !== oldCompanyId

    if (!hasRoleChange && !hasCompanyChange) {
      await auditLog({
        currentUser,
        action: "UPDATE",
        entity: "USER",
        entityId: user.id,
        description: "اطلاعات کاربر ویرایش شد",
        metadata: {
          username: user.username,
        },
      })
    }

    return updatedUser
  }
}

export default new UserService()
