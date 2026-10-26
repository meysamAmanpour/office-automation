import reportsRepository from "./reports.repository"

class ReportsService {
  async getLettersReport(filters) {
    return reportsRepository.getLettersReport(filters)
  }

  async getLettersSummary(filters) {
    return reportsRepository.getLettersSummary(filters)
  }
}

export default new ReportsService()
