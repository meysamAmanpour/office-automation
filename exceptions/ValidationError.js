import ApiError from "./ApiError"

export default class ValidationError extends ApiError {
  constructor(message, errors = null) {
    super(message, 400)

    this.errors = errors
  }
}
