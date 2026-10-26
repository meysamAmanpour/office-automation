import { prisma } from "@/lib/prisma"
import ConflictError from "@/exceptions/ConflictError"
import letterRepository from "./letter.repository"
import letterRecipientService from "./letter-recipient.service"
import { auditLog } from "@/helpers/audit/auditLogger"

class LetterService {
  async createLetter(data, currentUser) {
    const companyId = currentUser.companyId

    if (data.departmentId) {
      const department = await letterRepository.findDepartmentById(
        data.departmentId,
      )

      if (!department) {
        throw new ConflictError("دپارتمان پیدا نشد")
      }

      if (department.companyId !== companyId) {
        throw new ConflictError("دپارتمان انتخاب‌شده متعلق به شرکت شما نیست")
      }
    }

    const letterData = {
      ...data,
      companyId,
      creatorId: currentUser.id,
    }

    delete letterData.creatorIdFromBody

    const letter = await letterRepository.createLetter(letterData)

    await auditLog({
      currentUser,
      action: "CREATE",
      entity: "LETTER",
      entityId: letter.id,
      description: "نامه جدید ایجاد شد",
      metadata: {
        letterNumber: letter.letterNumber,
        subject: letter.subject,
        type: letter.type,
        status: letter.status,
        priority: letter.priority,
      },
    })

    return letter
  }

  async getLetters(filters) {
    return await letterRepository.getLetters(filters)
  }

  async getLetter(id) {
    return await letterRepository.findById(id)
  }

  async updateLetter(id, data, currentUser) {
    const letter = await letterRepository.findById(id)

    if (!letter) {
      throw new ConflictError("نامه پیدا نشد")
    }

    const userRole = currentUser.roleRelation?.name

    if (
      userRole !== "SUPER_ADMIN" &&
      letter.companyId !== currentUser.companyId
    ) {
      throw new ConflictError("عدم دسترسی به این نامه")
    }

    const companyId = letter.companyId

    if (data.departmentId) {
      const department = await letterRepository.findDepartmentById(
        data.departmentId,
      )

      if (!department) {
        throw new ConflictError("دپارتمان پیدا نشد")
      }

      if (department.companyId !== companyId) {
        throw new ConflictError("دپارتمان انتخاب‌شده متعلق به این شرکت نیست")
      }
    }

    delete data.companyId
    delete data.creatorId

    const updatedLetter = await letterRepository.updateLetter(id, data)

    const changes = {}

    const fields = [
      "letterNumber",
      "subject",
      "body",
      "type",
      "status",
      "priority",
      "departmentId",
      "senderName",
      "senderOrganization",
      "receiverName",
      "receiverOrganization",
    ]

    for (const field of fields) {
      if (data[field] !== undefined && data[field] !== letter[field]) {
        changes[field] = {
          before: letter[field],
          after: updatedLetter[field],
        }
      }
    }

    if (Object.keys(changes).length > 0) {
      await auditLog({
        currentUser,
        action: "UPDATE",
        entity: "LETTER",
        entityId: letter.id,
        description: "اطلاعات نامه ویرایش شد",
        metadata: {
          changes,
        },
      })
    }

    return updatedLetter
  }

  async deleteLetter(id, currentUser) {
    const letter = await letterRepository.findById(id)

    if (!letter) {
      throw new ConflictError("نامه پیدا نشد")
    }

    const userRole = currentUser.roleRelation?.name

    if (
      userRole !== "SUPER_ADMIN" &&
      letter.companyId !== currentUser.companyId
    ) {
      throw new ConflictError("عدم دسترسی به این نامه")
    }

    // فقط Draft را حذف می‌کنیم
    if (letter.status !== "DRAFT") {
      throw new ConflictError("فقط نامه‌های پیش‌نویس قابل حذف هستند")
    }

    return await letterRepository.softDelete(id)
  }
  async sendLetter(id, recipients, currentUser) {
    const letter = await letterRepository.findById(id)

    if (!letter) {
      throw new ConflictError("نامه پیدا نشد")
    }

    const userRole = currentUser.roleRelation?.name

    if (
      userRole !== "SUPER_ADMIN" &&
      letter.companyId !== currentUser.companyId
    ) {
      throw new ConflictError("عدم دسترسی به این نامه")
    }

    if (letter.status !== "DRAFT") {
      throw new ConflictError("فقط نامه‌های پیش‌نویس قابل ارسال هستند")
    }

    const validatedRecipients = await letterRecipientService.validateRecipients(
      recipients,
      letter.companyId,
    )

    if (validatedRecipients.length === 0) {
      throw new ConflictError("حداقل یک گیرنده انتخاب شود")
    }

    const updatedLetter = await prisma.$transaction(async (tx) => {
      const recipientData = validatedRecipients.map((recipient) => ({
        letterId: id,

        recipientType: recipient.type,

        userId: recipient.type === "USER" ? recipient.userId : null,

        departmentId:
          recipient.type === "DEPARTMENT" ? recipient.departmentId : null,

        companyId: recipient.type === "COMPANY" ? recipient.companyId : null,
      }))

      await tx.letterRecipient.createMany({
        data: recipientData,
      })

      return tx.letter.update({
        where: {
          id,
        },

        data: {
          status: "SENT",
        },

        include: {
          company: true,

          department: true,

          creator: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },

          recipients: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                },
              },

              department: true,

              company: true,
            },
          },
        },
      })
    })

    await auditLog({
      currentUser,

      action: "SEND",

      entity: "LETTER",

      entityId: letter.id,

      description: "نامه ارسال شد",

      metadata: {
        letterNumber: letter.letterNumber,

        subject: letter.subject,

        recipientCount: validatedRecipients.length,

        recipientTypes: validatedRecipients.map((recipient) => recipient.type),
      },
    })

    return updatedLetter
  }
}

export default new LetterService()
