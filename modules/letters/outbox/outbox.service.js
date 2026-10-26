import ConflictError from "@/exceptions/ConflictError"
import outboxRepository from "./outbox.repository"
import { auditLog } from "@/helpers/audit/auditLogger"
import letterRepository from "../letter.repository"
class OutboxService {
  async getUserOutbox({
    userId,
    companyId,
    search,
    status,
    priority,
    skip = 0,
    take = 10,
  }) {
    return outboxRepository.getUserOutbox({
      userId,
      companyId,
      search,
      status,
      priority,
      skip,
      take,
    })
  }
  async getUserOutboxDetail(id, userId, companyId) {
    return outboxRepository.getUserOutboxDetail(id, userId, companyId)
  }
  async getSummary(currentUser) {
    return outboxRepository.getSummary({
      userId: currentUser.id,
      companyId: currentUser.companyId,
    })
  }

  async updateDraft(id, currentUser, data) {
    const letter = await outboxRepository.getUserOutboxDetail(
      id,
      currentUser.id,
      currentUser.companyId,
    )

    if (!letter) {
      throw new ConflictError("نامه پیدا نشد")
    }

    if (letter.status !== "DRAFT") {
      throw new ConflictError("فقط نامه‌های پیش‌نویس قابل ویرایش هستند")
    }

    const updatedLetter = await outboxRepository.updateDraft(
      id,
      currentUser.id,
      currentUser.companyId,
      data,
    )

    const changes = {}

    const fields = [
      "letterNumber",
      "subject",
      "type",
      "priority",
      "departmentId",
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
        description: "پیش‌نویس نامه ویرایش شد",
        metadata: {
          changes,
        },
      })
    }

    return updatedLetter
  }

  async deleteDraft(id, currentUser) {
    const letter = await letterRepository.findById(id)

    if (!letter) {
      throw new ConflictError("نامه پیدا نشد")
    }

    if (letter.companyId !== currentUser.companyId) {
      throw new ConflictError("عدم دسترسی به این نامه")
    }

    if (letter.creatorId !== currentUser.id) {
      throw new ConflictError(
        "فقط ایجادکننده نامه می‌تواند پیش‌نویس را حذف کند",
      )
    }

    if (letter.status !== "DRAFT") {
      throw new ConflictError("فقط نامه‌های پیش‌نویس قابل حذف هستند")
    }

    const result = await letterRepository.softDelete(id)

    await auditLog({
      currentUser,
      action: "DELETE",
      entity: "LETTER",
      entityId: letter.id,
      description: "پیش‌نویس نامه حذف شد",
      metadata: {
        letterNumber: letter.letterNumber,
        subject: letter.subject,
        type: letter.type,
        status: letter.status,
      },
    })

    return result
  }
  async sendDraft(id, currentUser, data) {
    const letter = await outboxRepository.getUserOutboxDetail(
      id,
      currentUser.id,
      currentUser.companyId,
    )

    if (!letter) {
      throw new ConflictError("نامه پیدا نشد")
    }

    if (letter.status !== "DRAFT") {
      throw new ConflictError("فقط نامه‌های پیش‌نویس قابل ارسال هستند")
    }

    const recipients = data.recipients

    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new ConflictError("حداقل یک گیرنده باید انتخاب شود")
    }

    await outboxRepository.validateRecipients({
      recipients,
      companyId: currentUser.companyId,
    })

    return outboxRepository.sendDraft({
      letterId: id,
      userId: currentUser.id,
      companyId: currentUser.companyId,
      recipients,
    })
  }
}

export default new OutboxService()
