import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const user = await getCurrentUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const walletId = params.id

        // Verify wallet exists and belongs to user
        const wallet = await prisma.wallet.findUnique({
            where: { id: walletId },
        })

        if (!wallet) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
        }

        if (wallet.accountId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Fetch transactions for this wallet
        const transactions = await prisma.transaction.findMany({
            where: { walletId },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ transactions })
    } catch (error) {
        console.error("Error fetching wallet transactions:", error)
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }
}