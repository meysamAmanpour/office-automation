import AuthError from "@/exceptions/AuthError"

export default function authorize(currentUser, allowedRoles = []) {
  if (!currentUser) {
    throw new AuthError("ابتدا وارد شوید", 401)
  }

  const userRole = currentUser.roleRelation?.name || currentUser.role

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    throw new AuthError("شما دسترسی لازم برای انجام این عملیات را ندارید", 403)
  }

  return true
}
