export function getPagination(searchParams) {
  const page = Math.max(Number(searchParams.get("page")) || 1, 1)

  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || 10, 1),
    100,
  )

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  }
}

export function getPaginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  }
}
