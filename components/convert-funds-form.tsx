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
import { ArrowRight, RefreshCw } from "lucide-react"

interface ConvertFundsFormProps {
  wallets: Wallet[]
  onFundsConverted: (
    fromWallet: Wallet,
    toWallet: Wallet,
    rate: number,
    amount: number,
    convertedAmount: number,
  ) => void
}

export default function ConvertFundsForm({ wallets, onFundsConverted }: ConvertFundsFormProps) {
  const [fromWalletId, setFromWalletId] = useState("")
  const [toWalletId, setToWalletId] = useState("")
  const [amount, setAmount] = useState("")
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [rate, setRate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  const fromWallet = wallets.find((w) => w.id === fromWalletId)
  const toWallet = wallets.find((w) => w.id === toWalletId)

  useEffect(() => {
    // Reset converted amount when inputs change
    setConvertedAmount(null)
    setRate(null)
  }, [fromWalletId, toWalletId, amount])

  const calculateConversion = async () => {
    if (!fromWalletId || !toWalletId || !amount || Number.parseFloat(amount) <= 0) {
      return
    }

    if (fromWalletId === toWalletId) {
      toast.error("Please select different wallets")
      return
    }

    try {
      setIsCalculating(true)

      const API_KEY = "2878e8f7f080a3a887021fe1956030f1"
      const baseUrl = "https://api.exchangerate.host/live"

      const response = await axios.get(baseUrl, {
        params: {
          access_key: API_KEY,
          format: 1,
          source: fromWallet?.currency,
          currencies: toWallet?.currency,
        },
      })

      const rateKey = `${fromWallet?.currency}${toWallet?.currency}`
      const calculatedRate = response.data.quotes[rateKey]

      if (!calculatedRate) {
        toast.error("Failed to get exchange rate")
        return
      }

      const calculatedAmount = Number.parseFloat(amount) * calculatedRate
      setRate(calculatedRate)
      setConvertedAmount(calculatedAmount)
    } catch (error) {
      console.error("Error calculating conversion:", error)
      toast.error("Failed to calculate conversion")
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fromWalletId || !toWalletId || !amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please fill all fields with valid values")
      return
    }

    if (fromWalletId === toWalletId) {
      toast.error("Please select different wallets")
      return
    }

    try {
      setIsLoading(true)
      const response = await axios.post("/api/wallets/convert", {
        fromWalletId,
        toWalletId,
        amount: Number.parseFloat(amount),
      })

      onFundsConverted(
        response.data.fromWallet,
        response.data.toWallet,
        response.data.rate,
        Number.parseFloat(amount),
        response.data.convertedAmount,
      )

      setFromWalletId("")
      setToWalletId("")
      setAmount("")
      setConvertedAmount(null)
      setRate(null)
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to convert funds")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fromWallet">From Wallet</Label>
        <Select value={fromWalletId} onValueChange={setFromWalletId}>
          <SelectTrigger id="fromWallet">
            <SelectValue placeholder="Select source wallet" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id}>
                {wallet.name} ({wallet.currency}) - Balance: {wallet.currency} {wallet.balance.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount to Convert</Label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="100.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-8"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {fromWallet?.currency === "USD" && "$"}
            {fromWallet?.currency === "EUR" && "€"}
            {fromWallet?.currency === "RUB" && "₽"}
            {fromWallet?.currency === "GBP" && "£"}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <ArrowRight className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="toWallet">To Wallet</Label>
        <Select value={toWalletId} onValueChange={setToWalletId}>
          <SelectTrigger id="toWallet">
            <SelectValue placeholder="Select destination wallet" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id}>
                {wallet.name} ({wallet.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {fromWalletId && toWalletId && amount && Number.parseFloat(amount) > 0 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={calculateConversion}
            disabled={isCalculating}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Calculate Conversion
          </Button>
        </div>
      )}

      {convertedAmount !== null && rate !== null && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Conversion Preview:</div>
          <div className="font-medium">
            {amount} {fromWallet?.currency} = {convertedAmount.toFixed(2)} {toWallet?.currency}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Rate: 1 {fromWallet?.currency} = {rate.toFixed(4)} {toWallet?.currency}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Converting..." : "Convert Funds"}
      </Button>
    </form>
  )
}
