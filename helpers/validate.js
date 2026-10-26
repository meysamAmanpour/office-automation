import ValidationError from "@/exceptions/ValidationError"

export async function validate(request, validator) {
  const body = await request.json()

  const result = validator(body)

  if (!result.success) {
    throw new ValidationError(
      "اطلاعات وارد شده معتبر نیست",
      result.error.issues,
    )
  }

  return result.data
}

export function validateQuery(searchParams, validator) {
  const data = Object.fromEntries(searchParams.entries())

  const result = validator.safeParse(data)

  if (!result.success) {
    throw new ValidationError(
      "پارامترهای وارد شده معتبر نیستند",
      result.error.issues,
    )
  }

  return result.data
}
