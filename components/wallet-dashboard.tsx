"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import axios from "axios"
import {
  Plus,
  RefreshCw,
  LogOut,
  Wallet as WalletIcon,
  ArrowDownUp,
  Download,
  Settings,
  ChevronDown,
  Search,
  Banknote,
  TrendingUp,
  Shield,
  CircleDollarSign,
  BarChart3,
  Clock,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import CreateWalletForm from "./create-wallet-form"
import ImportFundsForm from "./import-funds-form"
import ConvertFundsForm from "./convert-funds-form"
import WalletCard from "./wallet-card"

export default function WalletDashboard({ initialWallets }) {
  const [wallets, setWallets] = useState(initialWallets)
  const [activeTab, setActiveTab] = useState("wallets")
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  // Filter wallets based on search term
  const filteredWallets = wallets.filter(wallet =>
      wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.currency.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate total balance in USD
  const getTotalBalance = () => {
    const exchangeRates = {
      USD: 1,
      EUR: 1.09,
      RUB: 0.011,
      GBP: 1.27,
      JPY: 0.0067,
      CNY: 0.14
    }

    return wallets.reduce((total, wallet) => {
      const rate = exchangeRates[wallet.currency] || 1
      return total + (wallet.balance * rate)
    }, 0)
  }

  const fetchWallets = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("/api/wallets")
      setWallets(response.data.wallets)
      toast.success("Wallets updated successfully")
    } catch (error) {
      toast.error("Failed to fetch wallets")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletCreated = (wallet) => {
    setWallets([...wallets, wallet])
    toast.success(`${wallet.currency} wallet created successfully!`)
    setActiveTab("wallets")
  }

  const handleFundsImported = (updatedWallet) => {
    setWallets(wallets.map((wallet) => (wallet.id === updatedWallet.id ? updatedWallet : wallet)))
    toast.success(`Funds imported successfully!`)
    setActiveTab("wallets")
  }

  const handleFundsConverted = (
      fromWallet,
      toWallet,
      rate,
      amount,
      convertedAmount,
  ) => {
    setWallets(
        wallets.map((wallet) => {
          if (wallet.id === fromWallet.id) return fromWallet
          if (wallet.id === toWallet.id) return toWallet
          return wallet
        }),
    )

    toast.success(
        `Converted ${amount} ${fromWallet.currency} to ${convertedAmount.toFixed(2)} ${toWallet.currency}`,
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

  const handleLockInRedirect = () => {
    router.push("/dashboard/locked-conversions/new")
  }
  const handleLockedsInRedirect = () => {
    router.push("/locked-conversions")
  }

  // Get unique currencies for filter badges
  const uniqueCurrencies = [...new Set(wallets.map(wallet => wallet.currency))]

  return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Button
                  onClick={fetchWallets}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="border-gray-200 hover:border-gray-300 transition-all"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Updating..." : "Refresh"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-200 hover:border-gray-300">
                    <Settings className="h-4 w-4 mr-2" />
                    Menu
                    <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Account Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Shield className="h-4 w-4 mr-2 text-gray-500" />
                    Security Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                    Transaction History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-500 focus:text-red-500 focus:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-indigo-50 to-white">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-700">Total Balance (USD)</p>
                    <h3 className="text-3xl font-bold mt-1">${getTotalBalance().toFixed(2)}</h3>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
                    <CircleDollarSign className="h-7 w-7 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-purple-50 to-white">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-violet-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Active Wallets</p>
                    <h3 className="text-3xl font-bold mt-1">{wallets.length}</h3>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                    <BarChart3 className="h-7 w-7 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-50 to-white">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-sky-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Last Updated</p>
                    <h3 className="text-xl font-medium mt-1">{new Date().toLocaleString()}</h3>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <TabsList className="p-1 bg-gray-50 rounded-xl">
                <TabsTrigger
                    value="wallets"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5"
                >
                  <WalletIcon className="h-4 w-4 mr-2" />
                  My Wallets
                </TabsTrigger>
                <TabsTrigger
                    value="create"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Wallet
                </TabsTrigger>
                <TabsTrigger
                    value="import"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Import Funds
                </TabsTrigger>
                <TabsTrigger
                    value="convert"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5"
                >
                  <ArrowDownUp className="h-4 w-4 mr-2" />
                  Convert Funds
                </TabsTrigger>
                <TabsTrigger
                    value="lock-in"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5"
                >

                  <Lock className="h-4 w-4 mr-2" />
                  Currency Lock-in Deposit
                </TabsTrigger>
              </TabsList>

              {activeTab === "wallets" && wallets.length > 0 && (
                  <div className="relative w-full lg:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search wallets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200 w-full"
                    />
                  </div>
              )}
            </div>

            {/* Wallet List Tab */}
            <TabsContent value="wallets" className="mt-2 focus:outline-none">
              {isLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full border-4 border-t-indigo-600 border-indigo-200 animate-spin mb-4"></div>
                      <p className="text-gray-500">Loading your wallets...</p>
                    </div>
                  </div>
              ) : wallets.length === 0 ? (
                  <Card className="border-dashed border-2 bg-gray-50">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <WalletIcon className="h-8 w-8 text-indigo-600" />
                      </div>
                      <CardTitle className="text-xl">No Wallets Yet</CardTitle>
                      <CardDescription className="max-w-md mx-auto">
                        Create your first wallet to start managing your finances across multiple currencies
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center pb-8">
                      <Button
                          onClick={() => setActiveTab("create")}
                          size="lg"
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Wallet
                      </Button>
                    </CardFooter>
                  </Card>
              ) : (
                  <>
                    {/* Currency Filter */}
                    {uniqueCurrencies.length > 1 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          <Badge
                              variant="outline"
                              className={`px-3 py-1 cursor-pointer ${searchTerm === "" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-gray-50 hover:bg-gray-100"}`}
                              onClick={() => setSearchTerm("")}
                          >
                            All Currencies ({wallets.length})
                          </Badge>
                          {uniqueCurrencies.map(currency => (
                              <Badge
                                  key={currency}
                                  variant="outline"
                                  className={`px-3 py-1 cursor-pointer ${searchTerm === currency ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-gray-50 hover:bg-gray-100"}`}
                                  onClick={() => setSearchTerm(currency)}
                              >
                                {currency}
                              </Badge>
                          ))}
                        </div>
                    )}

                    {/* Wallets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredWallets.map((wallet) => (
                          <WalletCard key={wallet.id} wallet={wallet} />
                      ))}

                      {/* Create New Wallet Card */}
                      <Card
                          className="flex flex-col items-center justify-center h-full min-h-[220px] border-dashed border-2 cursor-pointer bg-gray-50 hover:bg-gray-100/70 transition-colors"
                          onClick={() => setActiveTab("create")}
                      >
                        <CardContent className="flex flex-col items-center justify-center h-full py-8">
                          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                            <Plus className="h-8 w-8 text-indigo-600" />
                          </div>
                          <p className="text-gray-700 font-medium">Create New Wallet</p>
                          <p className="text-gray-500 text-sm mt-2 text-center">Add a new currency to your portfolio</p>
                        </CardContent>
                      </Card>
                    </div>
                  </>
              )}
            </TabsContent>

            {/* Create Wallet Tab */}
            <TabsContent value="create">
              <Card className="border-none shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle>Create New Wallet</CardTitle>
                      <CardDescription>Add a new currency wallet to your account</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CreateWalletForm onWalletCreated={handleWalletCreated} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Import Funds Tab */}
            <TabsContent value="import">
              <Card className="border-none shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-violet-500"></div>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Download className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Import Funds</CardTitle>
                      <CardDescription>Add funds to one of your existing wallets</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ImportFundsForm wallets={wallets} onFundsImported={handleFundsImported} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Convert Funds Tab */}
            <TabsContent value="convert">
              <Card className="border-none shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-sky-500"></div>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <ArrowDownUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Convert Funds</CardTitle>
                      <CardDescription>Exchange currencies between your wallets</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ConvertFundsForm wallets={wallets} onFundsConverted={handleFundsConverted} />
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="lock-in">
              <Card className="border-none shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle>Currency Lock-in Deposit</CardTitle>
                      <CardDescription>Lock your currency at a fixed exchange rate for higher returns</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-emerald-500">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-emerald-700">Earn up to 12% APY on your funds</h4>
                          <p className="text-emerald-600 text-sm mt-1">
                            Lock your currency for a fixed period and earn higher interest rates while protecting against market volatility.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                        onClick={handleLockInRedirect}
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                        size="lg"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Create New Lock-in Deposit
                    </Button>
                    <Button
                        onClick={handleLockedsInRedirect}
                        className="w-full bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                        size="lg"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Current Locked Deposits
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  )
}