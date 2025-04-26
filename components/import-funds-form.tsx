"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Wallet } from "@prisma/client"
import axios from "axios"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, CreditCard, Wallet as WalletIcon, DollarSign, TrendingUp } from "lucide-react"

interface ImportFundsFormProps {
  wallets: Wallet[]
  onFundsImported: (wallet: Wallet) => void
}

export default function ImportFundsForm({ wallets, onFundsImported }: ImportFundsFormProps) {
  const [walletId, setWalletId] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)

  useEffect(() => {
    if (walletId) {
      const wallet = wallets.find((w) => w.id === walletId)
      setSelectedWallet(wallet || null)
    } else {
      setSelectedWallet(null)
    }
  }, [walletId, wallets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!walletId) {
      toast.error("Please select a wallet")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      setIsLoading(true)
      const response = await axios.post("/api/wallets/import", {
        walletId,
        amount: Number.parseFloat(amount),
      })

      onFundsImported(response.data.wallet)
      toast.success(`Successfully imported ${getCurrencySymbol(selectedWallet?.currency)}${amount} to your wallet!`)
      setWalletId("")
      setAmount("")
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to import funds")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrencySymbol = (currency: string | undefined) => {
    switch (currency) {
      case "USD": return "$"
      case "EUR": return "€"
      case "RUB": return "₽"
      case "GBP": return "£"
      default: return ""
    }
  }

  const getBackgroundGradient = (currency: string | undefined) => {
    switch (currency) {
      case "USD": return "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
      case "EUR": return "from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950"
      case "RUB": return "from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950"
      case "GBP": return "from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950"
      default: return "from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950"
    }
  }

  const getButtonColor = (currency: string | undefined) => {
    switch (currency) {
      case "USD": return "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
      case "EUR": return "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
      case "RUB": return "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
      case "GBP": return "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
      default: return "bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700"
    }
  }

  const getCurrencyIcon = (currency: string | undefined) => {
    switch (currency) {
      case "USD": return <DollarSign className="h-5 w-5 text-green-500 dark:text-green-400" />
      case "EUR": return <CreditCard className="h-5 w-5 text-blue-500 dark:text-blue-400" />
      case "RUB": return <WalletIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
      case "GBP": return <TrendingUp className="h-5 w-5 text-purple-500 dark:text-purple-400" />
      default: return <WalletIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
    }
  }

  return (
      <Card className="w-full shadow-lg overflow-hidden">
        <CardHeader className={`bg-gradient-to-r ${selectedWallet ? getBackgroundGradient(selectedWallet.currency) : "from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950"}`}>
          <div className="flex items-center space-x-2">
            {selectedWallet ? getCurrencyIcon(selectedWallet.currency) : <PlusCircle className="h-5 w-5 text-slate-500" />}
            <CardTitle className="text-xl">Import Funds</CardTitle>
          </div>
          <CardDescription>
            Add money to your selected wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet" className="text-sm font-medium flex items-center">
                  Select Wallet
                  {selectedWallet && (
                      <Badge variant="outline" className="ml-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Balance: {getCurrencySymbol(selectedWallet.currency)}{selectedWallet.balance.toFixed(2)}
                      </Badge>
                  )}
                </Label>
                <Select value={walletId} onValueChange={setWalletId}>
                  <SelectTrigger id="wallet" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id} className="flex items-center">
                          <div className="flex items-center">
                            {getCurrencyIcon(wallet.currency)}
                            <span className="ml-2">{wallet.name} ({wallet.currency})</span>
                          </div>
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">Amount to Import</Label>
                <div className="relative">
                  <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="100.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    {getCurrencySymbol(selectedWallet?.currency)}
                  </div>
                </div>
              </div>
            </div>

            {selectedWallet && amount && Number.parseFloat(amount) > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Import Summary:</div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Current Balance:</span>
                      <div className="font-medium">
                        {getCurrencySymbol(selectedWallet.currency)}{selectedWallet.balance.toFixed(2)}
                      </div>
                    </div>
                    <div className="mx-2 text-slate-300">→</div>
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">New Balance:</span>
                      <div className="font-bold text-green-600 dark:text-green-400">
                        {getCurrencySymbol(selectedWallet.currency)}{(selectedWallet.balance + Number.parseFloat(amount)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
            )}

            <Button
                type="submit"
                className={`w-full text-white ${selectedWallet ? getButtonColor(selectedWallet.currency) : "bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700"}`}
                disabled={isLoading}
            >
              {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </div>
              ) : (
                  <div className="flex items-center">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Import Funds
                  </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
  )
}