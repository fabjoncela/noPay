// app/api/wallets/locked-conversions/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
    const user = await getCurrentUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Get status filter from query params if provided
        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")

        // Base query to get locked conversions for the current user
        const query = {
            where: {
                accountId: user.id,
                ...(status ? { status } : {})
            },
            include: {
                sourceWallet: true,
                targetWallet: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        }

        // Fetch locked conversions
        const lockedConversions = await prisma.lockedConversion.findMany(query)

        return NextResponse.json({ lockedConversions })
    } catch (error) {
        console.error("Error fetching locked conversions:", error)
        return NextResponse.json({ error: "Failed to fetch locked conversions" }, { status: 500 })
    }
}