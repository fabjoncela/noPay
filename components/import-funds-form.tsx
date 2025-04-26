"use client"

import type React from "react"

import { useState } from "react"
import type { Wallet } from "@prisma/client"
import axios from "axios"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ImportFundsFormProps {
  wallets: Wallet[]
  onFundsImported: (wallet: Wallet) => void
}

export default function ImportFundsForm({ wallets, onFundsImported }: ImportFundsFormProps) {
  const [walletId, setWalletId] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
      setWalletId("")
      setAmount("")
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to import funds")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="wallet">Select Wallet</Label>
        <Select value={walletId} onValueChange={setWalletId}>
          <SelectTrigger id="wallet">
            <SelectValue placeholder="Select wallet" />
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

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
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
            {walletId && wallets.find((w) => w.id === walletId)?.currency === "USD" && "$"}
            {walletId && wallets.find((w) => w.id === walletId)?.currency === "EUR" && "€"}
            {walletId && wallets.find((w) => w.id === walletId)?.currency === "RUB" && "₽"}
            {walletId && wallets.find((w) => w.id === walletId)?.currency === "GBP" && "£"}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Importing..." : "Import Funds"}
      </Button>
    </form>
  )
}
