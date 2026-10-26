export function companyDTO(company) {
  return {
    id: company.id,

    name: company.name,

    code: company.code,

    isActive: company.isActive,

    createdAt: company.createdAt,
  }
}
