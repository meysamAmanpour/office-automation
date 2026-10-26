import ApiError from "./ApiError"

export default class ConflictError extends ApiError {
  constructor(message) {
    super(message, 409)
  }
}
