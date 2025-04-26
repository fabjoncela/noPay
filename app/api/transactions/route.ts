// app/api/transactions/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
    const user = await getCurrentUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const walletId = searchParams.get('walletId')

        // Validate the walletId is provided and belongs to the user
        if (walletId) {
            const wallet = await prisma.wallet.findUnique({
                where: { id: walletId },
            })

            if (!wallet || wallet.accountId !== user.id) {
                return NextResponse.json({ error: "Unauthorized or wallet not found" }, { status: 401 })
            }

            // Fetch transactions for the specific wallet
            const transactions = await prisma.transaction.findMany({
                where: { walletId },
                orderBy: { createdAt: 'desc' },
            })

            // For locked conversion transactions, fetch the related locked conversion data
            const enhancedTransactions = await Promise.all(transactions.map(async (transaction) => {
                if (transaction.lockedConversionId) {
                    const lockedConversion = await prisma.lockedConversion.findUnique({
                        where: { id: transaction.lockedConversionId },
                    })
                    return { ...transaction, lockedConversion }
                }
                return transaction
            }))

            return NextResponse.json({ transactions: enhancedTransactions })
        } else {
            // Fetch all wallets belonging to the user
            const wallets = await prisma.wallet.findMany({
                where: { accountId: user.id },
            })

            if (!wallets.length) {
                return NextResponse.json({ transactions: [] })
            }

            // Fetch all transactions for all wallets belonging to the user
            const transactions = await prisma.transaction.findMany({
                where: {
                    walletId: {
                        in: wallets.map(wallet => wallet.id)
                    }
                },
                orderBy: { createdAt: 'desc' },
            })

            // For locked conversion transactions, fetch the related locked conversion data
            const enhancedTransactions = await Promise.all(transactions.map(async (transaction) => {
                if (transaction.lockedConversionId) {
                    const lockedConversion = await prisma.lockedConversion.findUnique({
                        where: { id: transaction.lockedConversionId },
                    })
                    return { ...transaction, lockedConversion }
                }
                return transaction
            }))

            return NextResponse.json({ transactions: enhancedTransactions })
        }
    } catch (error) {
        console.error("Error fetching transactions:", error)
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }
}