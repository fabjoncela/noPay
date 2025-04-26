import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  // Protected routes that require authentication
  if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/api/wallets")) {
    const authResponse = await requireAuth(request)
    if (authResponse) return authResponse
  }

  // Public routes
  if (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")) {
    // If user is already logged in, redirect to dashboard
    const authCookie = request.cookies.get("auth_token")
    if (authCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/wallets/:path*", "/login", "/register"],
}
