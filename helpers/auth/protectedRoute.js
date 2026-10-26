import asyncHandler from "@/helpers/asyncHandler"
import { checkPermissions } from "./checkPermissions"
import getCurrentUser from "./getCurrentUser"

import authorize from "./authorize"
// import checkPermission from "./checkPermission"

export default function protectedRoute(options = {}, handler) {
  const { roles = [], permissions = [] } = options

  return asyncHandler(async (request, context) => {
    const currentUser = await getCurrentUser(request)

    if (roles.length) {
      authorize(currentUser, roles)
    }

    if (permissions.length) {
      await checkPermissions(currentUser, permissions)
    }

    return handler(request, context, currentUser)
  })
}
