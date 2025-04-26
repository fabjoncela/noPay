import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import WalletDashboard from "@/components/wallet-dashboard"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  console.log("current user was used")
  if (!user) {
    console.log("current user was rejected")
    redirect("/login")
  }

  const account = await prisma.account.findUnique({
    where: { id: user.id },
    include: { wallets: true },
  })

  if (!account) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">UPay Dashboard</h1>
      <WalletDashboard initialWallets={account.wallets} />
    </div>
  )
}
