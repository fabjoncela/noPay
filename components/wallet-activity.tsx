"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
    ArrowUpRight,
    ArrowDownLeft,
    ArrowLeftRight,
    Clock,
    Download,
    Loader2,
    XCircle
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function WalletActivity({ wallet, onClose }) {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchTransactions()
    }, [wallet.id])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/wallets/${wallet.id}/transactions`)
            setTransactions(response.data.transactions)
            setLoading(false)
        } catch (err) {
            console.error("Error fetching transactions:", err)
            setError("Failed to load transaction history")
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    const formatAmount = (amount, currency) => {
        return `${getCurrencySymbol(currency)} ${Math.abs(amount).toFixed(2)}`
    }

    const getCurrencySymbol = (currency) => {
        switch (currency) {
            case "USD": return "$"
            case "EUR": return "€"
            case "RUB": return "₽"
            case "GBP": return "£"
            case "JPY": return "¥"
            case "CNY": return "¥"
            default: return currency
        }
    }

    const getTransactionTypeDetails = (type, amount) => {
        switch (type) {
            case "IMPORT":
                return {
                    label: "Import",
                    icon: <Download className="h-4 w-4" />,
                    color: "bg-green-100 text-green-800 border-green-200"
                }
            case "CONVERT_FROM":
                return {
                    label: "Converted Out",
                    icon: <ArrowUpRight className="h-4 w-4" />,
                    color: "bg-amber-100 text-amber-800 border-amber-200"
                }
            case "CONVERT_TO":
                return {
                    label: "Converted In",
                    icon: <ArrowDownLeft className="h-4 w-4" />,
                    color: "bg-blue-100 text-blue-800 border-blue-200"
                }
            default:
                return {
                    label: "Transaction",
                    icon: <ArrowLeftRight className="h-4 w-4" />,
                    color: "bg-gray-100 text-gray-800 border-gray-200"
                }
        }
    }

    return (
        <Card className="w-full shadow-lg border-none">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl">Transaction History</CardTitle>
                    <CardDescription>
                        {wallet.name} ({wallet.currency})
                    </CardDescription>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                >
                    <XCircle className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                            <p className="text-sm text-gray-500">Loading transaction history...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-start gap-3 my-4">
                        <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Error loading transactions</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Clock className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-1">No Transaction History</h3>
                        <p className="text-gray-500 max-w-md">
                            {wallet.balance > 0
                                ? "Funds have been imported, but no transactions have been made yet."
                                : "This wallet has no funds or transaction history yet."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 mt-2">
                        <div className="text-sm text-gray-500">Showing {transactions.length} transactions</div>
                        <div className="space-y-3">
                            {transactions.map((transaction) => {
                                const { label, icon, color } = getTransactionTypeDetails(transaction.type);
                                return (
                                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-full ${transaction.type === 'IMPORT' || transaction.type === 'CONVERT_TO' ? 'bg-green-100' : 'bg-amber-100'}`}>
                                                {icon}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {transaction.type === 'CONVERT_FROM' || transaction.type === 'CONVERT_TO'
                                                        ? `${label} (${transaction.sourceWalletId ? 'Exchange' : 'Unknown'})`
                                                        : label
                                                    }
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    <Clock className="inline h-3 w-3 mr-1" />
                                                    {formatDate(transaction.createdAt)}
                                                </div>

                                                {transaction.exchangeRate && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Exchange rate: {transaction.exchangeRate.toFixed(4)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                                                {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount, transaction.currency)}
                                            </div>
                                            <Badge variant="outline" className={`text-xs mt-1 px-2 py-0 ${color}`}>
                                                {label}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}