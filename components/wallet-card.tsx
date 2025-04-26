"use client"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  ArrowUpRight,
  Clock,
  CircleDollarSign,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export default function WalletCard({ wallet }) {
  const [isHovered, setIsHovered] = useState(false)

  const getCurrencyIcon = (currency) => {
    switch (currency) {
      case "USD":
        return "$"
      case "EUR":
        return "€"
      case "RUB":
        return "₽"
      case "GBP":
        return "£"
      case "JPY":
        return "¥"
      case "CNY":
        return "¥"
      default:
        return currency
    }
  }

  const getCurrencyColor = (currency) => {
    switch (currency) {
      case "USD":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "EUR":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "RUB":
        return "bg-red-50 text-red-700 border-red-200"
      case "GBP":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "JPY":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "CNY":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getBackgroundGradient = (currency) => {
    switch (currency) {
      case "USD":
        return "from-emerald-50 to-white"
      case "EUR":
        return "from-blue-50 to-white"
      case "RUB":
        return "from-red-50 to-white"
      case "GBP":
        return "from-purple-50 to-white"
      case "JPY":
        return "from-amber-50 to-white"
      case "CNY":
        return "from-green-50 to-white"
      default:
        return "from-gray-50 to-white"
    }
  }

  const getHeaderGradient = (currency) => {
    switch (currency) {
      case "USD":
        return "from-emerald-500 to-teal-500"
      case "EUR":
        return "from-blue-500 to-sky-500"
      case "RUB":
        return "from-red-500 to-rose-500"
      case "GBP":
        return "from-purple-500 to-violet-500"
      case "JPY":
        return "from-amber-500 to-yellow-500"
      case "CNY":
        return "from-green-500 to-emerald-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  return (
      <Card
          className={`overflow-hidden border-none shadow-md transition-all duration-300 ${isHovered ? 'shadow-lg scale-[1.02]' : ''} bg-gradient-to-br ${getBackgroundGradient(wallet.currency)}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`h-1 bg-gradient-to-r ${getHeaderGradient(wallet.currency)}`}></div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold">{wallet.name}</CardTitle>
              <CardDescription className="text-xs">
                Created on {new Date(wallet.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant="outline" className={`px-2 py-1 ${getCurrencyColor(wallet.currency)}`}>
              {getCurrencyIcon(wallet.currency)} {wallet.currency}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="mt-2 mb-4">
            <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <CircleDollarSign className="h-3 w-3" /> Balance
            </div>
            <div className="text-3xl font-bold">
              {getCurrencyIcon(wallet.currency)} {formatCurrency(wallet.balance)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button variant="outline" size="sm" className="text-xs">
              <ArrowUpRight className="h-3 w-3 mr-1" /> Send
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" /> Activity
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-0 text-xs text-gray-500">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {new Date(wallet.updatedAt).toLocaleString()}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>Edit Details</DropdownMenuItem>
              <DropdownMenuItem>Transaction History</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">Delete Wallet</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
  )
}