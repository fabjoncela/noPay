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

interface CreateWalletFormProps {
  onWalletCreated: (wallet: Wallet) => void
}

export default function CreateWalletForm({ onWalletCreated }: CreateWalletFormProps) {
  const [name, setName] = useState("")
  const [currency, setCurrency] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "RUB", name: "Russian Ruble" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CNY", name: "Chinese Yuan" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currency) {
      toast.error("Please select a currency")
      return
    }

    try {
      setIsLoading(true)
      const response = await axios.post("/api/wallets", {
        name: name || `${currency} Wallet`,
        currency,
      })

      onWalletCreated(response.data.wallet)
      setName("")
      setCurrency("")
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create wallet")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Wallet Name (Optional)</Label>
        <Input id="name" placeholder="My USD Wallet" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger id="currency">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                {curr.code} - {curr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Wallet"}
      </Button>
    </form>
  )
}
