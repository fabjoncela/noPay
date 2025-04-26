import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import WalletDashboard from "@/components/wallet-dashboard"
import { Settings } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const account = await prisma.account.findUnique({
    where: { id: user.id },
    include: { wallets: true },
  })

  if (!account) {
    redirect("/login")
  }

  const currentDateString = new Date().toLocaleString()

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <img
                  src="/upay-correct.png"
                alt="UPay Logo"
                className="h-10 w-10" // adjust the size as you like
            />
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              UPay
            </h1>

            <div className="flex items-center space-x-4">
              <button
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300"/>
              </button>
              <div className="flex items-center space-x-2">

              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Main Wallet Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <WalletDashboard
                initialWallets={account.wallets}
                currentDateString={currentDateString}
            />
          </div>
        </div>
      </div>
  )
}
