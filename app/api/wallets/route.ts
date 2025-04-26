import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const account = await prisma.account.findUnique({
      where: { id: user.id },
      include: { wallets: true },
    })

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json({ wallets: account.wallets })
  } catch (error) {
    console.error("Error fetching wallets:", error)
    return NextResponse.json({ error: "Failed to fetch wallets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, currency } = await request.json()

    if (!currency) {
      return NextResponse.json({ error: "Currency is required" }, { status: 400 })
    }

    // Check if wallet with this currency already exists
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        accountId: user.id,
        currency,
      },
    })

    if (existingWallet) {
      return NextResponse.json({ error: `Wallet with currency ${currency} already exists` }, { status: 400 })
    }

    const wallet = await prisma.wallet.create({
      data: {
        name: name || `${currency} Wallet`,
        currency,
        accountId: user.id,
      },
    })

    return NextResponse.json({ wallet })
  } catch (error) {
    console.error("Error creating wallet:", error)
    return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 })
  }
}
