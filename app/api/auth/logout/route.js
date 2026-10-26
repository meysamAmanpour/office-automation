import { NextResponse } from "next/server"

import protectedRoute from "@/helpers/auth/protectedRoute"
import { auditLog } from "@/helpers/audit/auditLogger"

export const POST = protectedRoute(
  {},

  async (request, context, currentUser) => {
    await auditLog({
      currentUser,

      action: "LOGOUT",

      entity: "AUTH",

      entityId: currentUser.id,

      description: "خروج موفق از سیستم",

      metadata: {
        username: currentUser.username,
        companyId: currentUser.companyId,
      },
    })

    const response = NextResponse.json({
      message: "Logout success",
    })

    response.cookies.delete("token")

    return response
  },
)
