import { NotFoundError, ValidationError } from "@/exceptions"
import companyRepository from "./company.repository"
import ConflictError from "@/exceptions/ConflictError"
import { auditLog } from "@/helpers/audit/auditLogger"
class CompanyService {
  async createCompany(data, currentUser) {
    const existingCompany = await companyRepository.findByCode(data.code)

    if (existingCompany) {
      throw new ValidationError("کد شرکت قبلاً ثبت شده است")
    }

    const company = await companyRepository.createCompany(data)

    await auditLog({
      currentUser,
      action: "CREATE",
      entity: "COMPANY",
      entityId: company.id,
      description: "شرکت جدید ایجاد شد",
      metadata: {
        name: company.name,
        code: company.code,
      },
    })

    return company
  }

  async getCompanyById(id) {
    const company = await companyRepository.findById(id)

    if (!company) {
      throw new ConflictError("شرکت یافت نشد")
    }
    return company
  }

  async getCompanies(filters = {}) {
    return await companyRepository.getCompanies(filters)
  }

  async updateCompany(id, data, currentUser) {
    const company = await companyRepository.findById(id)

    if (!company) {
      throw new NotFoundError("شرکت یافت نشد")
    }

    if (data.code && data.code !== company.code) {
      const existingCompany = await companyRepository.findByCode(data.code)

      if (existingCompany) {
        throw new ValidationError("کد شرکت قبلاً ثبت شده است")
      }
    }

    const updatedCompany = await companyRepository.updateCompany(id, data)

    await auditLog({
      currentUser,
      action: "UPDATE",
      entity: "COMPANY",
      entityId: updatedCompany.id,
      description: "اطلاعات شرکت ویرایش شد",
      metadata: {
        before: {
          name: company.name,
          code: company.code,
        },
        after: {
          name: updatedCompany.name,
          code: updatedCompany.code,
        },
      },
    })

    return updatedCompany
  }

  async deleteCompany(id, currentUser) {
    const company = await companyRepository.findById(id)

    if (!company) {
      throw new NotFoundError("شرکت یافت نشد")
    }

    const result = await companyRepository.softDelete(id)

    await auditLog({
      currentUser,
      action: "DELETE",
      entity: "COMPANY",
      entityId: id,
      description: "شرکت حذف شد",
      metadata: {
        name: company.name,
        code: company.code,
      },
    })

    return result
  }
}

export default new CompanyService()
