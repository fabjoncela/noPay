import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { walletId, amount } = await request.json()

    if (!walletId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Valid wallet ID and amount are required" }, { status: 400 })
    }

    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    })

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Verify wallet belongs to the logged-in user
    if (wallet.accountId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: wallet.balance + amount },
    })

    // Record the transaction
    await prisma.transaction.create({
      data: {
        type: "IMPORT",
        amount,
        currency: wallet.currency,
        walletId,
      },
    })

    return NextResponse.json({ wallet: updatedWallet })
  } catch (error) {
    console.error("Error importing funds:", error)
    return NextResponse.json({ error: "Failed to import funds" }, { status: 500 })
  }
}
