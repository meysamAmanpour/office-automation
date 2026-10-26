import inboxRepository from "./inbox.repository"

class InboxService {
  async getUserInbox(filters) {
    return await inboxRepository.getUserInbox(filters)
  }
}

export default new InboxService()
