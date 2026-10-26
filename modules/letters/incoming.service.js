import ConflictError from "@/exceptions/ConflictError"
import incomingRepository from "./incoming.repository"

class IncomingService {
  async getUserIncoming(filters) {
    return await incomingRepository.getUserIncoming(filters)
  }

  async getUserIncomingDetail(letterId, currentUser) {
    const letter = await incomingRepository.getUserIncomingDetail({
      letterId,

      userId: currentUser.id,

      companyId: currentUser.companyId,

      departmentId: currentUser.departmentId,
    })

    if (!letter) {
      throw new ConflictError("نامه پیدا نشد")
    }

    return letter
  }

  async receiveLetter(letterId, currentUser) {
    const recipient = await incomingRepository.receiveLetter({
      letterId,

      userId: currentUser.id,

      companyId: currentUser.companyId,

      departmentId: currentUser.departmentId,
    })

    if (!recipient) {
      throw new ConflictError("این نامه برای شما ارسال نشده است")
    }

    return recipient
  }

  async readLetter(letterId, currentUser) {
    const recipient = await incomingRepository.readLetter({
      letterId,
      userId: currentUser.id,
      companyId: currentUser.companyId,
      departmentId: currentUser.departmentId,
    })

    if (!recipient) {
      throw new ConflictError("این نامه برای شما ارسال نشده است")
    }

    return recipient
  }

  async archiveLetter(letterId, currentUser) {
    const recipient = await incomingRepository.archiveLetter({
      letterId,

      userId: currentUser.id,

      companyId: currentUser.companyId,

      departmentId: currentUser.departmentId,
    })

    if (!recipient) {
      throw new ConflictError("این نامه برای شما ارسال نشده است")
    }

    return recipient
  }

  async getUnreadCount(currentUser) {
    return incomingRepository.getUnreadCount({
      userId: currentUser.id,
      companyId: currentUser.companyId,
      departmentId: currentUser.departmentId,
    })
  }
  async getSummary(currentUser) {
    return incomingRepository.getSummary({
      userId: currentUser.id,
      companyId: currentUser.companyId,
      departmentId: currentUser.departmentId,
    })
  }
}

export default new IncomingService()
