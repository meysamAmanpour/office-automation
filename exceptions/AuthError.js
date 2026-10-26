import ApiError from "./ApiError"

export default class UnauthorizedError extends ApiError {
  constructor(message = "دسترسی غیرمجاز") {
    super(message, 401)
  }
}
