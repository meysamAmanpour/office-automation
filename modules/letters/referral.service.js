import { prisma } from "@/lib/prisma"
import ApiError from "@/exceptions/ApiError"
import referralRepository from "./referral.repository"
import auditLogService from "@/modules/audit-logs/audit-log.service"
import letterRepository from "./letter.repository"
import userRepository from "../users/user.repository"
import departmentRepository from "../departments/department.repository"
class ReferralService {
  async createReferral(data, currentUser) {
    const {
      letterId,
      targetType,
      targetUserId,
      targetDepartmentId,
      parentId,
      description,
      priority,
      dueDate,
    } = data

    // 1. بررسی وجود نامه
    const letter = await letterRepository.findById(letterId)

    if (!letter) {
      throw new NotFoundError("نامه موردنظر پیدا نشد")
    }

    // 2. بررسی شرکت نامه
    if (letter.companyId !== currentUser.companyId) {
      throw new ForbiddenError("شما دسترسی لازم برای ارجاع این نامه را ندارید")
    }

    // 3. نامه نباید در وضعیت DRAFT باشد
    if (letter.status === "DRAFT") {
      throw new ValidationError("نامه پیش‌نویس را نمی‌توان ارجاع داد")
    }

    // 4. بررسی ارجاع به خود
    if (targetType === "USER" && targetUserId === currentUser.id) {
      throw new ValidationError("امکان ارجاع نامه به خودتان وجود ندارد")
    }

    // 5. بررسی کاربر مقصد
    if (targetType === "USER") {
      const targetUser = await userRepository.findById(targetUserId)

      if (!targetUser) {
        throw new NotFoundError("کاربر مقصد پیدا نشد")
      }

      if (targetUser.companyId !== currentUser.companyId) {
        throw new ForbiddenError("کاربر مقصد متعلق به شرکت شما نیست")
      }

      if (!targetUser.isActive || targetUser.isDeleted) {
        throw new ValidationError("کاربر مقصد فعال نیست")
      }
    }

    // 6. بررسی واحد مقصد
    if (targetType === "DEPARTMENT") {
      const targetDepartment =
        await departmentRepository.findById(targetDepartmentId)

      if (!targetDepartment) {
        throw new NotFoundError("واحد مقصد پیدا نشد")
      }

      if (targetDepartment.companyId !== currentUser.companyId) {
        throw new ForbiddenError("واحد مقصد متعلق به شرکت شما نیست")
      }

      if (targetDepartment.isDeleted) {
        throw new ValidationError("واحد مقصد فعال نیست")
      }
    }

    // 7. بررسی parent referral
    if (parentId) {
      const parentReferral = await referralRepository.findById(parentId)

      if (!parentReferral) {
        throw new NotFoundError("ارجاع قبلی پیدا نشد")
      }

      // ارجاع قبلی باید مربوط به همان نامه باشد
      if (parentReferral.letterId !== letterId) {
        throw new ValidationError("ارجاع قبلی متعلق به این نامه نیست")
      }

      // ارجاع رد یا لغو شده نباید ادامه پیدا کند
      if (
        parentReferral.status === "REJECTED" ||
        parentReferral.status === "CANCELLED"
      ) {
        throw new ValidationError(
          "امکان ادامه دادن ارجاع رد یا لغوشده وجود ندارد",
        )
      }
    }

    // 8. ایجاد ارجاع
    const referral = await referralRepository.create({
      letterId,
      senderId: currentUser.id,
      targetType,
      targetUserId: targetType === "USER" ? targetUserId : null,
      targetDepartmentId:
        targetType === "DEPARTMENT" ? targetDepartmentId : null,
      parentId: parentId || null,
      description: description || null,
      priority: priority || "NORMAL",
      dueDate: dueDate || null,
      status: "PENDING",
    })

    // 9. ثبت Audit Log
    try {
      await auditLogService.createLog({
        userId: currentUser.id,
        companyId: currentUser.companyId,
        action: "REFERRAL_CREATED",
        entity: "LETTER_REFERRAL",
        entityId: referral.id,
        description: "ارجاع نامه ایجاد شد",
        metadata: {
          letterId: referral.letterId,
          targetType: referral.targetType,
          targetUserId: referral.targetUserId,
          targetDepartmentId: referral.targetDepartmentId,
          priority: referral.priority,
          parentId: referral.parentId,
        },
      })
    } catch (error) {
      console.error("AUDIT LOG ERROR:", error)
    }

    // 10. بازگرداندن ارجاع
    return referral
  }

  async receiveReferral(referralId, currentUser) {
    const referral = await referralRepository.findById(referralId)

    if (!referral) {
      throw new ApiError("ارجاع پیدا نشد", 404)
    }

    // فقط ارجاع PENDING قابل دریافت است
    if (referral.status !== "PENDING") {
      throw new ApiError("این ارجاع در وضعیت قابل دریافت نیست", 400)
    }

    // ارجاع به کاربر
    if (
      referral.targetType === "USER" &&
      referral.targetUserId !== currentUser.id
    ) {
      throw new ApiError("شما گیرنده این ارجاع نیستید", 403)
    }

    // ارجاع به واحد
    if (
      referral.targetType === "DEPARTMENT" &&
      referral.targetDepartmentId !== currentUser.departmentId
    ) {
      throw new ApiError("شما عضو واحد مقصد این ارجاع نیستید", 403)
    }

    // تغییر وضعیت ارجاع
    const updatedReferral = await referralRepository.updateStatus(referralId, {
      status: "RECEIVED",
      receivedAt: new Date(),
    })

    // ثبت Audit Log
    try {
      await auditLogService.createLog({
        userId: currentUser.id,
        companyId: currentUser.companyId,
        action: "REFERRAL_RECEIVED",
        entity: "LETTER_REFERRAL",
        entityId: referral.id,
        description: "ارجاع نامه دریافت شد",
        metadata: {
          letterId: referral.letterId,
          referralId: referral.id,
          targetType: referral.targetType,
          previousStatus: "PENDING",
          newStatus: "RECEIVED",
        },
      })
    } catch (error) {
      console.error("AUDIT LOG ERROR:", error)
    }

    return updatedReferral
  }

  async startReferral(referralId, currentUser) {
    const referral = await referralRepository.findById(referralId)

    if (!referral) {
      throw new ApiError("ارجاع پیدا نشد", 404)
    }

    if (referral.status !== "RECEIVED") {
      throw new ApiError("این ارجاع در وضعیت قابل شروع نیست", 400)
    }

    // ارجاع مستقیم به کاربر
    if (
      referral.targetType === "USER" &&
      referral.targetUserId !== currentUser.id
    ) {
      throw new ApiError("شما گیرنده این ارجاع نیستید", 403)
    }

    // ارجاع به واحد
    if (
      referral.targetType === "DEPARTMENT" &&
      referral.targetDepartmentId !== currentUser.departmentId
    ) {
      throw new ApiError("شما عضو واحد مقصد این ارجاع نیستید", 403)
    }

    // تغییر وضعیت ارجاع
    const updatedReferral = await referralRepository.updateStatus(referralId, {
      status: "IN_PROGRESS",
      startedAt: new Date(),
    })

    // ثبت Audit Log
    try {
      await auditLogService.createLog({
        userId: currentUser.id,
        companyId: currentUser.companyId,
        action: "REFERRAL_STARTED",
        entity: "LETTER_REFERRAL",
        entityId: referral.id,
        description: "رسیدگی به ارجاع نامه آغاز شد",
        metadata: {
          letterId: referral.letterId,
          referralId: referral.id,
          targetType: referral.targetType,
          previousStatus: "RECEIVED",
          newStatus: "IN_PROGRESS",
        },
      })
    } catch (error) {
      console.error("AUDIT LOG ERROR:", error)
    }

    return updatedReferral
  }

  async completeReferral(referralId, currentUser, completionNote) {
    const referral = await referralRepository.findById(referralId)

    if (!referral) {
      throw new ApiError("ارجاع پیدا نشد", 404)
    }

    if (referral.status !== "IN_PROGRESS") {
      throw new ApiError("این ارجاع در وضعیت قابل تکمیل نیست", 400)
    }

    if (
      referral.targetType === "USER" &&
      referral.targetUserId !== currentUser.id
    ) {
      throw new ApiError("شما گیرنده این ارجاع نیستید", 403)
    }

    if (
      referral.targetType === "DEPARTMENT" &&
      referral.targetDepartmentId !== currentUser.departmentId
    ) {
      throw new ApiError("شما عضو واحد مقصد این ارجاع نیستید", 403)
    }

    // تغییر وضعیت ارجاع به DONE
    const updatedReferral = await referralRepository.updateStatus(referralId, {
      status: "DONE",
      completedAt: new Date(),
      completionNote: completionNote || null,
    })

    // ثبت Audit Log
    try {
      await auditLogService.createLog({
        userId: currentUser.id,
        companyId: currentUser.companyId,
        action: "REFERRAL_COMPLETED",
        entity: "LETTER_REFERRAL",
        entityId: referral.id,
        description: "ارجاع نامه تکمیل شد",
        metadata: {
          letterId: referral.letterId,
          referralId: referral.id,
          targetType: referral.targetType,
          previousStatus: "IN_PROGRESS",
          newStatus: "DONE",
          completionNote: completionNote || null,
        },
      })
    } catch (error) {
      console.error("AUDIT LOG ERROR:", error)
    }

    return updatedReferral
  }

  async rejectReferral(referralId, currentUser, reason) {
    const referral = await referralRepository.findById(referralId)

    if (!referral) {
      throw new ApiError("ارجاع پیدا نشد", 404)
    }

    if (referral.status !== "PENDING" && referral.status !== "RECEIVED") {
      throw new ApiError("این ارجاع در وضعیت قابل رد نیست", 400)
    }

    if (
      referral.targetType === "USER" &&
      referral.targetUserId !== currentUser.id
    ) {
      throw new ApiError("شما گیرنده این ارجاع نیستید", 403)
    }

    if (
      referral.targetType === "DEPARTMENT" &&
      referral.targetDepartmentId !== currentUser.departmentId
    ) {
      throw new ApiError("شما عضو واحد مقصد این ارجاع نیستید", 403)
    }

    // رد کردن ارجاع
    const updatedReferral = await referralRepository.updateStatus(referralId, {
      status: "REJECTED",
      rejectionReason: reason || null,
    })

    // ثبت Audit Log
    try {
      await auditLogService.createLog({
        userId: currentUser.id,
        companyId: currentUser.companyId,
        action: "REFERRAL_REJECTED",
        entity: "LETTER_REFERRAL",
        entityId: referral.id,
        description: "ارجاع نامه رد شد",
        metadata: {
          letterId: referral.letterId,
          referralId: referral.id,
          targetType: referral.targetType,
          previousStatus: referral.status,
          newStatus: "REJECTED",
          rejectionReason: reason || null,
        },
      })
    } catch (error) {
      console.error("AUDIT LOG ERROR:", error)
    }

    return updatedReferral
  }

  async cancelReferral(referralId, currentUser, reason) {
    const referral = await referralRepository.findById(referralId)

    if (!referral) {
      throw new ApiError("ارجاع پیدا نشد", 404)
    }

    if (referral.status !== "PENDING" && referral.status !== "RECEIVED") {
      throw new ApiError("این ارجاع در وضعیت قابل لغو نیست", 400)
    }

    // فقط فرستنده ارجاع می‌تواند آن را لغو کند
    if (referral.senderId !== currentUser.id) {
      throw new ApiError("فقط فرستنده ارجاع می‌تواند آن را لغو کند", 403)
    }

    // لغو ارجاع
    const updatedReferral = await referralRepository.updateStatus(referralId, {
      status: "CANCELLED",
      cancellationReason: reason || null,
    })

    // ثبت Audit Log
    try {
      await auditLogService.createLog({
        userId: currentUser.id,
        companyId: currentUser.companyId,
        action: "REFERRAL_CANCELLED",
        entity: "LETTER_REFERRAL",
        entityId: referral.id,
        description: "ارجاع نامه لغو شد",
        metadata: {
          letterId: referral.letterId,
          referralId: referral.id,
          targetType: referral.targetType,
          previousStatus: referral.status,
          newStatus: "CANCELLED",
          cancellationReason: reason || null,
        },
      })
    } catch (error) {
      console.error("AUDIT LOG ERROR:", error)
    }

    return updatedReferral
  }

  async getReferralChain(letterId, currentUser) {
    const referrals = await referralRepository.findChainByLetter(letterId)

    const accessibleReferrals = referrals.filter((referral) => {
      const senderCompanyId = referral.sender?.companyId

      const targetUserCompanyId = referral.targetUser?.companyId

      const targetDepartmentCompanyId = referral.targetDepartment?.companyId

      return (
        senderCompanyId === currentUser.companyId ||
        targetUserCompanyId === currentUser.companyId ||
        targetDepartmentCompanyId === currentUser.companyId
      )
    })

    return accessibleReferrals
  }
}

export default new ReferralService()
