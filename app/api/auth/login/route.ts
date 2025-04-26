import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createToken, setAuthCookie } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
      )
    }

    const user = await prisma.account.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
      )
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name || ""
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

    return setAuthCookie(response, token)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
    )
  }
}