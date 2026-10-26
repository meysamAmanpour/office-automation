import ApiError from "./ApiError"

export default class NotFoundError extends ApiError {
  constructor(message = "رکورد یافت نشد") {
    super(message, 404)
  }
}
