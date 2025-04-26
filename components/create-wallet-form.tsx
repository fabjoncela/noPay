"use client"
import { useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  CircleDollarSign,
  CreditCard
} from "lucide-react"

export default function CreateWalletForm({ onWalletCreated }) {
  const [name, setName] = useState("")
  const [currency, setCurrency] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const currencies = [
    { code: "USD", name: "US Dollar", icon: "$" },
    { code: "EUR", name: "Euro", icon: "€" },
    { code: "RUB", name: "Russian Ruble", icon: "₽" },
    { code: "GBP", name: "British Pound", icon: "£" },
    { code: "JPY", name: "Japanese Yen", icon: "¥" },
    { code: "CNY", name: "Chinese Yuan", icon: "¥" },
  ]

  const handleSubmit = async (e) => {
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
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create wallet")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            Wallet Name (Optional)
          </Label>
          <Input
              id="name"
              placeholder="My USD Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-gray-200"
          />
          <p className="text-xs text-gray-500">
            If not provided, the wallet will be named automatically based on the currency.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-gray-500" />
            Currency
          </Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency" className="border-gray-200">
              <SelectValue placeholder="Select a currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 inline-block text-center font-medium">{curr.icon}</span>
                      {curr.code} - {curr.name}
                    </div>
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Wallet"}
        </Button>
      </form>
  )
}