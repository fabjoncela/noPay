"use client"

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import LockedConversionsList from "@/components/LockedConversionsList"
import { ArrowLeft, Lock, Shield, RefreshCw, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function LockedConversionsPage() {




    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                        <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Currency Lock-in Deposits</h1>
                        <p className="text-gray-600 mt-1">Manage your locked currency conversions and track their performance</p>
                    </div>

                    <Link
                        href="/dashboard/locked-conversions/new"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium rounded-lg shadow-sm"
                    >
                        <Lock className="h-4 w-4 mr-2" />
                        New Lock-in Deposit
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
                    <div className="h-1 bg-emerald-500 absolute top-0 left-0 right-0"></div>
                    <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Protected Funds</h3>
                            <p className="text-gray-500 text-sm mt-1">Your funds are protected against market volatility</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
                    <div className="h-1 bg-blue-500 absolute top-0 left-0 right-0"></div>
                    <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <RefreshCw className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Real-time Rates</h3>
                            <p className="text-gray-500 text-sm mt-1">Compare locked rates with current market rates</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
                    <div className="h-1 bg-purple-500 absolute top-0 left-0 right-0"></div>
                    <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Increased Returns</h3>
                            <p className="text-gray-500 text-sm mt-1">Secure Your Earnings Up to a 20% Price Change and claim positive rates</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8">
                <LockedConversionsList />
            </div>
        </div>
    )
}