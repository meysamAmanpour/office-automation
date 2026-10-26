import ForbiddenError from "@/exceptions/ForbiddenError"

import auditLogRepository from "./audit-log.repository"

class AuditLogService {
  async createLog({
    userId = null,
    companyId = null,
    action,
    entity = null,
    entityId = null,
    description = null,
    metadata = null,
  }) {
    if (!action) {
      throw new Error("نوع عملیات برای ثبت لاگ الزامی است")
    }

    return auditLogRepository.create({
      userId,
      companyId,
      action,
      entity,
      entityId,
      description,
      metadata,
    })
  }

  async getLogs({
    currentUser,
    userId,
    action,
    entity,
    search = "",
    skip = 0,
    take = 10,
  }) {
    const userRole = currentUser.roleRelation?.name

    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      throw new ForbiddenError(
        "شما دسترسی لازم برای مشاهده گزارش فعالیت‌ها را ندارید",
      )
    }

    const companyId =
      userRole === "SUPER_ADMIN" ? undefined : currentUser.companyId

    return auditLogRepository.getLogs({
      companyId,
      userId,
      action,
      entity,
      search,
      skip,
      take,
    })
  }

  async getLogById(id, currentUser) {
    const userRole = currentUser.roleRelation?.name

    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      throw new ForbiddenError(
        "شما دسترسی لازم برای مشاهده این گزارش فعالیت را ندارید",
      )
    }

    const log = await auditLogRepository.findById(id)

    if (!log) {
      return null
    }

    // SUPER_ADMIN همه را می‌بیند
    if (userRole === "SUPER_ADMIN") {
      return log
    }

    // ADMIN فقط شرکت خودش
    if (log.companyId !== currentUser.companyId) {
      throw new ForbiddenError("عدم دسترسی به این گزارش فعالیت")
    }

    return log
  }
}

export default new AuditLogService()
