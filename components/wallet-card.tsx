import type { Wallet } from "@prisma/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface WalletCardProps {
  wallet: Wallet
}

export default function WalletCard({ wallet }: WalletCardProps) {
  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$"
      case "EUR":
        return "€"
      case "RUB":
        return "₽"
      case "GBP":
        return "£"
      default:
        return currency
    }
  }

  const getCurrencyColor = (currency: string) => {
    switch (currency) {
      case "USD":
        return "bg-green-100 text-green-800 border-green-200"
      case "EUR":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "RUB":
        return "bg-red-100 text-red-800 border-red-200"
      case "GBP":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const currency = wallet.currency

  return (
    <Card className="overflow-hidden">
      <div
        className={`h-2 ${currency === "USD" ? "bg-green-500" : currency === "EUR" ? "bg-blue-500" : currency === "RUB" ? "bg-red-500" : "bg-purple-500"}`}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{wallet.name}</CardTitle>
            <CardDescription>Created on {new Date(wallet.createdAt).toLocaleDateString()}</CardDescription>
          </div>
          <Badge className={getCurrencyColor(wallet.currency)}>
            {getCurrencyIcon(wallet.currency)} {wallet.currency}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {getCurrencyIcon(wallet.currency)} {formatCurrency(wallet.balance)}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 pt-2">
        <div className="text-xs text-muted-foreground">Last updated: {new Date(wallet.updatedAt).toLocaleString()}</div>
      </CardFooter>
    </Card>
  )
}
