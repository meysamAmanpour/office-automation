import ApiError from "./ApiError"

export default class ForbiddenError extends ApiError {
  constructor(message = "دسترسی ممنوع") {
    super(message, 403)
  }
}
