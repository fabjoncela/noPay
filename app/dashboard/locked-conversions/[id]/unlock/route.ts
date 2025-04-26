import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const id = params.id

    // Get the locked conversion
    const lockedConversion = await prisma.lockedConversion.findUnique({
      where: { id },
      include: {
        sourceWallet: true,
        targetWallet: true,
      },
    })

    if (!lockedConversion) {
      return NextResponse.json({ error: "Locked conversion not found" }, { status: 404 })
    }

    // Verify the locked conversion belongs to the logged-in user
    if (lockedConversion.accountId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the conversion is already unlocked
    if (lockedConversion.status !== "ACTIVE") {
      return NextResponse.json({ error: "Conversion is not active" }, { status: 400 })
    }

    // Check if the unlock date has passed
    if (new Date() < new Date(lockedConversion.unlockDate)) {
      return NextResponse.json({ error: "Conversion is still locked" }, { status: 400 })
    }

    // Update the target wallet and the locked conversion in a transaction
    const [updatedTargetWallet, updatedLockedConversion] = await prisma.$transaction([
      // Add the converted amount to the target wallet
      prisma.wallet.update({
        where: { id: lockedConversion.targetWalletId },
        data: { balance: lockedConversion.targetWallet.balance + lockedConversion.targetAmount },
      }),
      // Update the locked conversion status
      prisma.lockedConversion.update({
        where: { id },
        data: {
          status: "UNLOCKED",
          actualUnlockDate: new Date(),
        },
        include: {
          sourceWallet: true,
          targetWallet: true,
        },
      }),
    ])

    // Record the transaction
    await prisma.transaction.create({
      data: {
        type: "UNLOCK_TO",
        amount: lockedConversion.targetAmount,
        currency: lockedConversion.targetCurrency,
        walletId: lockedConversion.targetWalletId,
        lockedConversionId: lockedConversion.id,
      },
    })

    return NextResponse.json({
      success: true,
      lockedConversion: updatedLockedConversion,
      targetWallet: updatedTargetWallet,
    })
  } catch (error) {
    console.error("Error unlocking conversion:", error)
    return NextResponse.json({ error: "Failed to unlock conversion" }, { status: 500 })
  }
}
