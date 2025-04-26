import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const id = params.id

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

    // If the conversion is active, get the current exchange rate
    let currentRate = null
    let rateDifference = null
    let canUnlock = false

    if (lockedConversion.status === "ACTIVE") {
      try {
        const API_KEY = "2878e8f7f080a3a887021fe1956030f1"
        const baseUrl = "https://api.exchangerate.host/live"

        const response = await fetch(
          `${baseUrl}?access_key=${API_KEY}&format=1&source=${lockedConversion.sourceCurrency}&currencies=${lockedConversion.targetCurrency}`,
        )
        const data = await response.json()

        const rateKey = `${lockedConversion.sourceCurrency}${lockedConversion.targetCurrency}`
        currentRate = data.quotes[rateKey]

        if (currentRate) {
          rateDifference = ((currentRate - lockedConversion.exchangeRate) / lockedConversion.exchangeRate) * 100
        }

        // Check if the conversion can be unlocked (past unlock date)
        canUnlock = new Date() >= new Date(lockedConversion.unlockDate)
      } catch (error) {
        console.error("Error fetching current rate:", error)
      }
    }

    return NextResponse.json({
      lockedConversion,
      currentRate,
      rateDifference,
      canUnlock,
    })
  } catch (error) {
    console.error("Error fetching locked conversion:", error)
    return NextResponse.json({ error: "Failed to fetch locked conversion" }, { status: 500 })
  }
}
