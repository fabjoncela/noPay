import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import axios from "axios"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { fromWalletId, toWalletId, amount } = await request.json()

    if (!fromWalletId || !toWalletId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Valid wallet IDs and amount are required" }, { status: 400 })
    }

    // Get source wallet
    const fromWallet = await prisma.wallet.findUnique({
      where: { id: fromWalletId },
    })

    if (!fromWallet) {
      return NextResponse.json({ error: "Source wallet not found" }, { status: 404 })
    }

    // Verify wallet belongs to the logged-in user
    if (fromWallet.accountId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if source wallet has enough funds
    if (fromWallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 })
    }

    // Get destination wallet
    const toWallet = await prisma.wallet.findUnique({
      where: { id: toWalletId },
    })

    if (!toWallet) {
      return NextResponse.json({ error: "Destination wallet not found" }, { status: 404 })
    }

    // Verify destination wallet belongs to the same user
    if (toWallet.accountId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get exchange rate
    const API_KEY = "2878e8f7f080a3a887021fe1956030f1"
    const baseUrl = "https://api.exchangerate.host/live"

    const response = await axios.get(baseUrl, {
      params: {
        access_key: API_KEY,
        format: 1,
        source: fromWallet.currency,
        currencies: toWallet.currency,
      },
    })

    const rateKey = `${fromWallet.currency}${toWallet.currency}`
    const rate = response.data.quotes[rateKey]

    if (!rate) {
      return NextResponse.json({ error: "Failed to get exchange rate" }, { status: 500 })
    }

    const convertedAmount = amount * rate

    // Update wallets in a transaction
    const [updatedFromWallet, updatedToWallet] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: fromWalletId },
        data: { balance: fromWallet.balance - amount },
      }),
      prisma.wallet.update({
        where: { id: toWalletId },
        data: { balance: toWallet.balance + convertedAmount },
      }),
    ])

    // Record the transactions
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          type: "CONVERT_FROM",
          amount: -amount,
          currency: fromWallet.currency,
          walletId: fromWalletId,
          sourceWalletId: toWalletId,
          exchangeRate: rate,
        },
      }),
      prisma.transaction.create({
        data: {
          type: "CONVERT_TO",
          amount: convertedAmount,
          currency: toWallet.currency,
          walletId: toWalletId,
          sourceWalletId: fromWalletId,
          exchangeRate: rate,
        },
      }),
    ])

    return NextResponse.json({
      fromWallet: updatedFromWallet,
      toWallet: updatedToWallet,
      rate,
      convertedAmount,
    })
  } catch (error) {
    console.error("Error converting funds:", error)
    return NextResponse.json({ error: "Failed to convert funds" }, { status: 500 })
  }
}
