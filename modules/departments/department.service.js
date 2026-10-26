import departmentRepository from "./department.repository"
import ConflictError from "@/exceptions/ConflictError"
class DepartmentService {
  async createDepartment(data) {
    const existingDepartment = await departmentRepository.findByName(
      data.name,
      data.companyId,
    )

    if (existingDepartment) {
      throw new ConflictError("این دپارتمان قبلاً ثبت شده است")
    }

    //بررسی وجود شرکت
    const company = await departmentRepository.findCompanyById(data.companyId)
    if (!company) {
      throw new ConflictError("شرکت مورد نظر یافت نشد")
    }

    return await departmentRepository.createDepartment(data)
  }

  async getDepartments(filters = {}) {
    return await departmentRepository.getDepartments(filters)
  }

  async getDepartment(id) {
    return await departmentRepository.findById(id)
  }

  async updateDepartment(id, data) {
    return await departmentRepository.updateDepartment(id, data)
  }

  async deleteDepartment(id) {
    const usersCount = await departmentRepository.countUsers(id)

    if (usersCount > 0) {
      throw new ConflictError(
        "امکان حذف این دپارتمان وجود ندارد، ابتدا کاربران آن را منتقل یا حذف کنید",
      )
    }

    return await departmentRepository.softDelete(id)
  }
}

export default new DepartmentService()
