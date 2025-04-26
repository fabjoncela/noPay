"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import {
    ArrowDownRight,
    ArrowUpRight,
    RefreshCw,
    Calendar,
    Search,
    Lock,
    Unlock,
    Clock
} from "lucide-react"
import { format } from "date-fns"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function TransactionHistory({ wallets }) {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedWallet, setSelectedWallet] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [timeFilter, setTimeFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState("all")

    const fetchTransactions = async (walletId = null) => {
        setLoading(true)
        try {
            const url = walletId && walletId !== "all"
                ? `/api/transactions?walletId=${walletId}`
                : "/api/transactions"

            const response = await axios.get(url)
            setTransactions(response.data.transactions)
        } catch (error) {
            console.error("Failed to fetch transactions:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions(selectedWallet === "all" ? null : selectedWallet)
    }, [selectedWallet])

    const getTransactionTypeIcon = (type) => {
        switch (type) {
            case "IMPORT":
                return <ArrowDownRight className="h-5 w-5 text-green-500" />
            case "CONVERT_FROM":
                return <RefreshCw className="h-5 w-5 text-orange-500" />
            case "CONVERT_TO":
                return <RefreshCw className="h-5 w-5 text-blue-500" />
            case "LOCK_FROM":
                return <Lock className="h-5 w-5 text-red-500" />
            case "LOCK_TO":
                return <Lock className="h-5 w-5 text-green-500" />
            case "UNLOCK_FROM":
                return <Unlock className="h-5 w-5 text-red-500" />
            case "UNLOCK_TO":
                return <Unlock className="h-5 w-5 text-green-500" />
            default:
                return <ArrowUpRight className="h-5 w-5 text-red-500" />
        }
    }

    const getTransactionTypeLabel = (type) => {
        switch (type) {
            case "IMPORT":
                return "Deposit"
            case "CONVERT_FROM":
                return "Convert Out"
            case "CONVERT_TO":
                return "Convert In"
            case "LOCK_FROM":
                return "Lock Funds Out"
            case "LOCK_TO":
                return "Lock Funds In"
            case "UNLOCK_FROM":
                return "Unlock Funds Out"
            case "UNLOCK_TO":
                return "Unlock Funds In"
            default:
                return type.replace(/_/g, " ")
        }
    }

    const getTransactionTypes = () => {
        const types = new Set(transactions.map(t => t.type))
        return Array.from(types)
    }

    const getTimeFilteredTransactions = () => {
        if (timeFilter === "all") return transactions

        const now = new Date()
        const filterDate = new Date()

        switch (timeFilter) {
            case "today":
                filterDate.setHours(0, 0, 0, 0)
                break
            case "week":
                filterDate.setDate(now.getDate() - 7)
                break
            case "month":
                filterDate.setMonth(now.getMonth() - 1)
                break
            default:
                return transactions
        }

        return transactions.filter(transaction =>
            new Date(transaction.createdAt) >= filterDate
        )
    }

    const getFilteredTransactions = () => {
        let filtered = getTimeFilteredTransactions()

        // Apply type filter
        if (typeFilter !== "all") {
            filtered = filtered.filter(transaction => transaction.type === typeFilter)
        }

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(transaction =>
                transaction.type.toLowerCase().includes(term) ||
                transaction.currency.toLowerCase().includes(term) ||
                (transaction.amount.toString()).includes(term)
            )
        }

        return filtered
    }

    const filteredTransactions = getFilteredTransactions()

    const getWalletNameById = (id) => {
        const wallet = wallets.find(w => w.id === id)
        return wallet ? wallet.name : "Unknown Wallet"
    }

    const formatAmount = (amount, currency) => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })

        return formatter.format(amount)
    }

    const getTransactionDetails = (transaction) => {
        if (transaction.type.includes('CONVERT')) {
            return (
                <span>
          {transaction.type === 'CONVERT_FROM' ? 'To' : 'From'}: {getWalletNameById(transaction.sourceWalletId)}
                    {transaction.exchangeRate && (
                        <span className="ml-2 text-xs text-gray-400">
              (Rate: {transaction.exchangeRate.toFixed(4)})
            </span>
                    )}
        </span>
            )
        }

        if (transaction.type.includes('LOCK') || transaction.type.includes('UNLOCK')) {
            if (transaction.lockedConversion) {
                const lc = transaction.lockedConversion
                return (
                    <div className="flex flex-col">
            <span>
              {transaction.type.includes('FROM') ? 'To' : 'From'}: {
                transaction.type.includes('FROM')
                    ? getWalletNameById(lc.targetWalletId)
                    : getWalletNameById(lc.sourceWalletId)
            }
            </span>
                        <span className="text-xs text-gray-400">
              Rate: {lc.exchangeRate.toFixed(4)} | Fee: {lc.feePercentage}%
            </span>
                        {transaction.type.includes('LOCK') && (
                            <span className="text-xs text-gray-400">
                Unlocks: {format(new Date(lc.unlockDate), 'MMM dd, yyyy')}
              </span>
                        )}
                    </div>
                )
            }

            return (
                <span>
          {transaction.sourceWalletId && (
              <>
                  {transaction.type.includes('FROM') ? 'To' : 'From'}: {getWalletNameById(transaction.sourceWalletId)}
              </>
          )}
        </span>
            )
        }

        return null
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Transaction History</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Wallet" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Wallets</SelectItem>
                            {wallets.map((wallet) => (
                                <SelectItem key={wallet.id} value={wallet.id}>
                                    {wallet.name} ({wallet.currency})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Time Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Transaction Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {getTransactionTypes().map((type) => (
                                <SelectItem key={type} value={type}>
                                    {getTransactionTypeLabel(type)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredTransactions.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Wallet
                                </th>
                                {selectedWallet === "all" && (
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Currency
                                    </th>
                                )}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Details
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center">
                                                        {getTransactionTypeIcon(transaction.type)}
                                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                {getTransactionTypeLabel(transaction.type)}
                              </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{transaction.type}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                          transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatAmount(transaction.amount, transaction.currency)}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {getWalletNameById(transaction.walletId)}
                                    </td>
                                    {selectedWallet === "all" && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {transaction.currency}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {getTransactionDetails(transaction)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                            No transactions found.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                </div>
                <Button
                    onClick={() => fetchTransactions(selectedWallet === "all" ? null : selectedWallet)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>
        </div>
    )
}