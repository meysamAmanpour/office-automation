export function getToken(request) {
  const authHeader = request.headers.get("authorization")

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1]
  }

  const cookieToken = request.cookies.get("token")?.value

  return cookieToken || null
}
