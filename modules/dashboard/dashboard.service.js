import dashboardRepository from "./dashboard.repository"

class DashboardService {
  async getSummary({ userRole, companyId } = {}) {
    const isSuperAdmin = userRole === "SUPER_ADMIN"

    // SUPER_ADMIN کل سیستم را می‌بیند
    // سایر نقش‌ها فقط شرکت خودشان را
    const scopedCompanyId = isSuperAdmin ? undefined : companyId

    const [letterSummary, userSummary, departmentSummary, companySummary] =
      await Promise.all([
        dashboardRepository.getLetterSummary({
          companyId: scopedCompanyId,
        }),

        dashboardRepository.getUserSummary({
          companyId: scopedCompanyId,
        }),

        dashboardRepository.getDepartmentCount({
          companyId: scopedCompanyId,
        }),

        // تعداد شرکت‌ها فقط برای SUPER_ADMIN معنی دارد
        isSuperAdmin
          ? dashboardRepository.getCompanyCount()
          : Promise.resolve(null),
      ])

    return {
      letters: letterSummary,
      users: userSummary,
      departments: departmentSummary,
      companies: companySummary,
    }
  }
}

export default new DashboardService()
