import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createToken, setAuthCookie } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingAccount = await prisma.account.findUnique({
      where: { email },
    })

    if (existingAccount) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const account = await prisma.account.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    // Create JWT token
    const token = await createToken({
      id: account.id,
      email: account.email,
      name,
    })

    // Set the token in a cookie
    setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: account.id,
        email: account.email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: error}, { status: 500 })
  }
}
