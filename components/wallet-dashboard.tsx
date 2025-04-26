"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Wallet } from "@prisma/client"
import { toast } from "react-toastify"
import axios from "axios"
import { Plus, RefreshCw, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateWalletForm from "./create-wallet-form"
import ImportFundsForm from "./import-funds-form"
import ConvertFundsForm from "./convert-funds-form"
import WalletCard from "./wallet-card"

interface WalletDashboardProps {
  initialWallets: Wallet[]
}

export default function WalletDashboard({ initialWallets }: WalletDashboardProps) {
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets)
  const [activeTab, setActiveTab] = useState("wallets")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const fetchWallets = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("/api/wallets")
      setWallets(response.data.wallets)
    } catch (error) {
      toast.error("Failed to fetch wallets")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletCreated = (wallet: Wallet) => {
    setWallets([...wallets, wallet])
    toast.success(`${wallet.currency} wallet created successfully!`)
    setActiveTab("wallets")
  }

  const handleFundsImported = (updatedWallet: Wallet) => {
    setWallets(wallets.map((wallet) => (wallet.id === updatedWallet.id ? updatedWallet : wallet)))
    toast.success(`Funds imported successfully!`)
    setActiveTab("wallets")
  }

  const handleFundsConverted = (
    fromWallet: Wallet,
    toWallet: Wallet,
    rate: number,
    amount: number,
    convertedAmount: number,
  ) => {
    setWallets(
      wallets.map((wallet) => {
        if (wallet.id === fromWallet.id) return fromWallet
        if (wallet.id === toWallet.id) return toWallet
        return wallet
      }),
    )

    toast.success(
      `Converted ${amount} ${fromWallet.currency} to ${convertedAmount.toFixed(2)} ${toWallet.currency} at rate ${rate}`,
    )
    setActiveTab("wallets")
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout")
      toast.success("Logged out successfully")
      router.push("/login")
      router.refresh()
    } catch (error) {
      toast.error("Failed to log out")
      console.error(error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Wallets</h2>
        <div className="flex gap-2">
          <Button onClick={fetchWallets} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="wallets">My Wallets</TabsTrigger>
          <TabsTrigger value="create">Create Wallet</TabsTrigger>
          <TabsTrigger value="import">Import Funds</TabsTrigger>
          <TabsTrigger value="convert">Convert Funds</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets">
          {wallets.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Wallets Yet</CardTitle>
                <CardDescription>Create your first wallet to get started</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Wallet
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
              <Card
                className="flex flex-col items-center justify-center h-full min-h-[200px] border-dashed cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setActiveTab("create")}
              >
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <Plus className="h-12 w-12 mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground font-medium">Create New Wallet</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Wallet</CardTitle>
              <CardDescription>Add a new currency wallet to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateWalletForm onWalletCreated={handleWalletCreated} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Funds</CardTitle>
              <CardDescription>Add funds to one of your existing wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <ImportFundsForm wallets={wallets} onFundsImported={handleFundsImported} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convert">
          <Card>
            <CardHeader>
              <CardTitle>Convert Funds</CardTitle>
              <CardDescription>Convert funds between your wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <ConvertFundsForm wallets={wallets} onFundsConverted={handleFundsConverted} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
