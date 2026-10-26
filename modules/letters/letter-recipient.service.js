import ConflictError from "@/exceptions/ConflictError"

import letterRecipientRepository from "./letter-recipient.repository"
import letterRepository from "./letter.repository"
import { auditLog } from "@/helpers/audit/auditLogger"

class LetterRecipientService {
  async validateRecipients(recipients, companyId) {
    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new ConflictError("حداقل یک گیرنده باید انتخاب شود")
    }

    const validatedRecipients = []

    for (const recipient of recipients) {
      if (!recipient?.type) {
        throw new ConflictError("نوع گیرنده مشخص نشده است")
      }

      if (recipient.type === "USER") {
        if (!recipient.userId) {
          throw new ConflictError("شناسه کاربر گیرنده الزامی است")
        }

        const user = await letterRecipientRepository.findUserById(
          recipient.userId,
        )

        if (!user) {
          throw new ConflictError("کاربر گیرنده پیدا نشد")
        }

        if (user.companyId !== companyId) {
          throw new ConflictError("کاربر گیرنده متعلق به شرکت شما نیست")
        }

        validatedRecipients.push({
          type: "USER",
          userId: user.id,
        })
      } else if (recipient.type === "DEPARTMENT") {
        if (!recipient.departmentId) {
          throw new ConflictError("شناسه دپارتمان گیرنده الزامی است")
        }

        const department = await letterRecipientRepository.findDepartmentById(
          recipient.departmentId,
        )

        if (!department) {
          throw new ConflictError("دپارتمان گیرنده پیدا نشد")
        }

        if (department.companyId !== companyId) {
          throw new ConflictError("دپارتمان گیرنده متعلق به شرکت شما نیست")
        }

        validatedRecipients.push({
          type: "DEPARTMENT",
          departmentId: department.id,
        })
      } else if (recipient.type === "COMPANY") {
        if (!recipient.companyId) {
          throw new ConflictError("شناسه شرکت گیرنده الزامی است")
        }

        const company = await letterRecipientRepository.findCompanyById(
          recipient.companyId,
        )

        if (!company) {
          throw new ConflictError("شرکت گیرنده پیدا نشد")
        }

        validatedRecipients.push({
          type: "COMPANY",
          companyId: company.id,
        })
      } else {
        throw new ConflictError("نوع گیرنده نامعتبر است")
      }
    }

    return validatedRecipients
  }

  async createRecipients(letterId, recipients, companyId) {
    const validatedRecipients = await this.validateRecipients(
      recipients,
      companyId,
    )

    const data = validatedRecipients.map((recipient) => ({
      letterId,

      recipientType: recipient.type,

      userId: recipient.type === "USER" ? recipient.userId : null,

      departmentId:
        recipient.type === "DEPARTMENT" ? recipient.departmentId : null,

      companyId: recipient.type === "COMPANY" ? recipient.companyId : null,
    }))

    return await letterRecipientRepository.createMany(data)
  }

  async getLetterRecipients(letterId) {
    return await letterRecipientRepository.findByLetterId(letterId)
  }

  async receiveLetter(letterId, userId) {
    const recipient = await letterRecipientRepository.findUserRecipient(
      letterId,
      userId,
    )

    if (!recipient) {
      throw new ConflictError("این نامه برای شما ارسال نشده است")
    }

    if (recipient.status !== "PENDING") {
      throw new ConflictError("این نامه قبلاً دریافت شده است")
    }

    const updatedRecipient = await letterRecipientRepository.receive(
      recipient.id,
    )

    await auditLog({
      currentUser: {
        id: userId,
        companyId: recipient.letter.companyId,
      },

      action: "RECEIVE",

      entity: "LETTER",

      entityId: letterId,

      description: "نامه دریافت شد",

      metadata: {
        recipientId: recipient.id,
        recipientType: recipient.recipientType,
        receivedAt: updatedRecipient.receivedAt,
      },
    })

    return updatedRecipient
  }

  async markLetterAsRead(letterId, userId) {
    const recipient = await letterRecipientRepository.findUserRecipient(
      letterId,
      userId,
    )

    if (!recipient) {
      throw new ConflictError("این نامه برای شما ارسال نشده است")
    }

    if (recipient.status === "PENDING") {
      throw new ConflictError("ابتدا باید نامه را دریافت کنید")
    }

    if (recipient.status === "READ") {
      return recipient
    }

    const updatedRecipient = await letterRecipientRepository.markAsRead(
      recipient.id,
    )

    await auditLog({
      currentUser: {
        id: userId,
        companyId: recipient.letter.companyId,
      },

      action: "READ",

      entity: "LETTER",

      entityId: letterId,

      description: "نامه مشاهده شد",

      metadata: {
        recipientId: recipient.id,
        recipientType: recipient.recipientType,
        readAt: updatedRecipient.readAt,
      },
    })

    return updatedRecipient
  }

  async archiveLetter(letterId, userId) {
    const recipient = await letterRecipientRepository.findUserRecipient(
      letterId,
      userId,
    )

    if (!recipient) {
      throw new ConflictError("این نامه برای شما ارسال نشده است")
    }

    if (recipient.status === "ARCHIVED") {
      throw new ConflictError("این نامه قبلاً بایگانی شده است")
    }

    if (recipient.status !== "RECEIVED" && recipient.status !== "READ") {
      throw new ConflictError("ابتدا باید نامه را دریافت کنید")
    }

    const updatedRecipient = await letterRecipientRepository.archive(
      recipient.id,
    )

    await auditLog({
      currentUser: {
        id: userId,
        companyId: recipient.letter.companyId,
      },

      action: "ARCHIVE",

      entity: "LETTER",

      entityId: letterId,

      description: "نامه بایگانی شد",

      metadata: {
        recipientId: recipient.id,
        recipientType: recipient.recipientType,
        archivedAt: updatedRecipient.updatedAt,
      },
    })

    return updatedRecipient
  }
}

export default new LetterRecipientService()
