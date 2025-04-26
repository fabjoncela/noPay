import { NextResponse } from "next/server"
import { removeAuthCookie } from "@/lib/auth"

export async function POST() {
  removeAuthCookie()
  return NextResponse.json({ success: true })
}
