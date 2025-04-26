import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-secret-key-at-least-32-characters-long"
)

export interface UserJwtPayload {
  id: string
  email: string
  name?: string
  iat: number
  exp: number
}

export async function createToken(payload: Omit<UserJwtPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserJwtPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload as UserJwtPayload
}

// Updated cookie handler
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: "auth-token", // Changed to hyphen for consistency
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "strict",
  })

  return response
}

export function removeAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete("auth-token")
  return response
}

export async function getCurrentUser(req?: NextRequest): Promise<UserJwtPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = req ? req.cookies.get("auth-token")?.value : cookieStore.get("auth-token")?.value

    if (!token) return null

    return await verifyToken(token)
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function requireAuth(req: NextRequest): Promise<NextResponse | null> {
  const user = await getCurrentUser(req)

  if (!user) {
    const url = new URL("/login", req.url)
    url.searchParams.set("from", req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return null
}