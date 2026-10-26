import { NextResponse } from "next/server"
import { verifyTokenEdge } from "./lib/jwt-edge"

export async function middleware(request) {
  const token = request.cookies.get("token")?.value

  const { pathname } = request.nextUrl

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const user = await verifyTokenEdge(token)

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
