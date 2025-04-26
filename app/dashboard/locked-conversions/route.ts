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
    const status = searchParams.get("status")

    const whereClause = {
      accountId: user.id,
      ...(status ? { status: status } : {}),
    }

    const lockedConversions = await prisma.lockedConversion.findMany({
      where: whereClause,
      include: {
        sourceWallet: true,
        targetWallet: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ lockedConversions })
  } catch (error) {
    console.error("Error fetching locked conversions:", error)
    return NextResponse.json({ error: "Failed to fetch locked conversions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { sourceWalletId, targetWalletId, sourceAmount, lockPeriodMonths } = await request.json()

    if (!sourceWalletId || !targetWalletId || !sourceAmount || !lockPeriodMonths) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get source wallet
    const sourceWallet = await prisma.wallet.findUnique({
      where: { id: sourceWalletId },
    })

    if (!sourceWallet) {
      return NextResponse.json({ error: "Source wallet not found" }, { status: 404 })
    }

    // Verify wallet belongs to the logged-in user
    if (sourceWallet.accountId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if source wallet has enough funds
    if (sourceWallet.balance < sourceAmount) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 })
    }

    // Get destination wallet
    const targetWallet = await prisma.wallet.findUnique({
      where: { id: targetWalletId },
    })

    if (!targetWallet) {
      return NextResponse.json({ error: "Target wallet not found" }, { status: 404 })
    }

    // Verify destination wallet belongs to the same user
    if (targetWallet.accountId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Calculate fee (3%)
    const feePercentage = 3.0
    const fee = sourceAmount * (feePercentage / 100)
    const netAmount = sourceAmount - fee

    // Get exchange rate
    const API_KEY = "2878e8f7f080a3a887021fe1956030f1"
    const baseUrl = "https://api.exchangerate.host/live"

    const response = await fetch(
      `${baseUrl}?access_key=${API_KEY}&format=1&source=${sourceWallet.currency}&currencies=${targetWallet.currency}`,
    )
    const data = await response.json()

    const rateKey = `${sourceWallet.currency}${targetWallet.currency}`
    const rate = data.quotes[rateKey]

    if (!rate) {
      return NextResponse.json({ error: "Failed to get exchange rate" }, { status: 500 })
    }

    const convertedAmount = netAmount * rate

    // Calculate unlock date
    const unlockDate = new Date()
    unlockDate.setMonth(unlockDate.getMonth() + lockPeriodMonths)

    // Create locked conversion in a transaction
    const [updatedSourceWallet, lockedConversion] = await prisma.$transaction([
      // Update source wallet balance
      prisma.wallet.update({
        where: { id: sourceWalletId },
        data: { balance: sourceWallet.balance - sourceAmount },
      }),
      // Create locked conversion
      prisma.lockedConversion.create({
        data: {
          accountId: user.id,
          sourceWalletId,
          targetWalletId,
          sourceAmount,
          targetAmount: convertedAmount,
          sourceCurrency: sourceWallet.currency,
          targetCurrency: targetWallet.currency,
          exchangeRate: rate,
          fee,
          feePercentage,
          status: "ACTIVE",
          unlockDate,
        },
        include: {
          sourceWallet: true,
          targetWallet: true,
        },
      }),
    ])

    // Record the transactions
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          type: "LOCK_FROM",
          amount: -sourceAmount,
          currency: sourceWallet.currency,
          walletId: sourceWalletId,
          lockedConversionId: lockedConversion.id,
        },
      }),
    ])

    return NextResponse.json({ lockedConversion })
  } catch (error) {
    console.error("Error creating locked conversion:", error)
    return NextResponse.json({ error: "Failed to create locked conversion" }, { status: 500 })
  }
}
