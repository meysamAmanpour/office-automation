import checkPermission from "./checkPermission"

export async function checkPermissions(
  currentUser,
  permissions = [],
  mode = "all",
) {
  if (mode === "any") {
    for (const permission of permissions) {
      try {
        await checkPermission(currentUser, permission)

        return true
      } catch {}
    }

    return false
  }

  for (const permission of permissions) {
    await checkPermission(currentUser, permission)
  }

  return true
}
