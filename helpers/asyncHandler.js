import { failure } from "@/helpers/apiResponse"

export default function asyncHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error(error)

      return failure(
        error.message || "خطای داخلی سرور",
        error.statusCode || 500,
        error.errors || null,
      )
    }
  }
}
