import outgoingRepository from "./outgoing.repository"

class OutgoingService {
  async getUserOutgoing(filters) {
    return await outgoingRepository.getUserOutgoing(filters)
  }
}

export default new OutgoingService()
