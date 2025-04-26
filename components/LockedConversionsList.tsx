"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

type Wallet = {
  id: string
  name: string
  currency: string
}

type LockedConversion = {
  id: string
  sourceWalletId: string
  targetWalletId: string
  sourceWallet: Wallet
  targetWallet: Wallet
  sourceAmount: number
  targetAmount: number
  sourceCurrency: string
  targetCurrency: string
  exchangeRate: number
  fee: number
  feePercentage: number
  status: string
  lockDate: string
  unlockDate: string
  actualUnlockDate: string | null
  createdAt: string
}

export default function LockedConversionsList() {
  const router = useRouter()
  const [conversions, setConversions] = useState<LockedConversion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [currentRates, setCurrentRates] = useState<Record<string, number>>({})
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchConversions()
  }, [activeFilter])

  const fetchConversions = async () => {
    try {
      const url = activeFilter
        ? `/api/wallets/locked-conversions?status=${activeFilter}`
        : "/api/wallets/locked-conversions"

      const response = await axios.get(url)
      setConversions(response.data.lockedConversions)

      // Fetch current rates for active conversions
      const activeConversions = response.data.lockedConversions.filter((c: LockedConversion) => c.status === "ACTIVE")

      fetchCurrentRates(activeConversions)
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch locked conversions")
      setLoading(false)
    }
  }

  const fetchCurrentRates = async (activeConversions: LockedConversion[]) => {
    const rates: Record<string, number> = {}
    const API_KEY = "2878e8f7f080a3a887021fe1956030f1"
    const baseUrl = "https://api.exchangerate.host/live"

    for (const conversion of activeConversions) {
      try {
        const response = await axios.get(baseUrl, {
          params: {
            access_key: API_KEY,
            format: 1,
            source: conversion.sourceCurrency,
            currencies: conversion.targetCurrency,
          },
        })

        const rateKey = `${conversion.sourceCurrency}${conversion.targetCurrency}`
        const currentRate = response.data.quotes[rateKey]

        if (currentRate) {
          rates[conversion.id] = currentRate
        }
      } catch (err) {
        console.error("Error fetching rate:", err)
      }
    }

    setCurrentRates(rates)
  }

  const handleUnlock = async (id: string) => {
    try {
      setProcessingId(id)
      await axios.post(`/api/wallets/locked-conversions/${id}/unlock`)
      fetchConversions()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to unlock conversion")
    } finally {
      setProcessingId(null)
    }
  }

  const calculateRateDifference = (conversion: LockedConversion) => {
    if (!currentRates[conversion.id]) return null

    const lockedRate = conversion.exchangeRate
    const currentRate = currentRates[conversion.id]

    return ((currentRate - lockedRate) / lockedRate) * 100
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const canUnlock = (conversion: LockedConversion) => {
    return conversion.status === "ACTIVE" && new Date() >= new Date(conversion.unlockDate)
  }

  if (loading) {
    return <div className="text-center py-6">Loading locked conversions...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Locked Currency Conversions</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1 text-sm rounded-md ${
              activeFilter === null ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("ACTIVE")}
            className={`px-3 py-1 text-sm rounded-md ${
              activeFilter === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter("UNLOCKED")}
            className={`px-3 py-1 text-sm rounded-md ${
              activeFilter === "UNLOCKED"
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Unlocked
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-3 rounded-md border border-red-200 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {conversions.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No locked conversions found</p>
          <button
            onClick={() => router.push("/dashboard/locked-conversions/new")}
            className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Create a Locked Conversion
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {conversions.map((conversion) => (
            <div
              key={conversion.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">
                  {conversion.sourceAmount.toFixed(2)} {conversion.sourceCurrency} →{" "}
                  {conversion.targetAmount.toFixed(2)} {conversion.targetCurrency}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    conversion.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : conversion.status === "UNLOCKED"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {conversion.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="text-gray-600">Source Wallet:</div>
                <div>{conversion.sourceWallet.name}</div>

                <div className="text-gray-600">Target Wallet:</div>
                <div>{conversion.targetWallet.name}</div>

                <div className="text-gray-600">Locked Rate:</div>
                <div className="font-medium">
                  1 {conversion.sourceCurrency} = {conversion.exchangeRate.toFixed(4)} {conversion.targetCurrency}
                </div>

                {conversion.status === "ACTIVE" && currentRates[conversion.id] && (
                  <>
                    <div className="text-gray-600">Current Rate:</div>
                    <div className="font-medium">
                      1 {conversion.sourceCurrency} = {currentRates[conversion.id].toFixed(4)}{" "}
                      {conversion.targetCurrency}
                    </div>

                    <div className="text-gray-600">Rate Change:</div>
                    <div
                      className={`font-medium ${
                        calculateRateDifference(conversion)! >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {calculateRateDifference(conversion)?.toFixed(2)}%
                    </div>
                  </>
                )}

                <div className="text-gray-600">Transaction Fee:</div>
                <div className="text-amber-600">
                  {conversion.fee.toFixed(2)} {conversion.sourceCurrency} ({conversion.feePercentage}%)
                </div>

                <div className="text-gray-600">Lock Date:</div>
                <div>{formatDate(conversion.lockDate)}</div>

                <div className="text-gray-600">Unlock Date:</div>
                <div
                  className={
                    conversion.status === "ACTIVE" && new Date() >= new Date(conversion.unlockDate)
                      ? "text-green-600 font-medium"
                      : ""
                  }
                >
                  {formatDate(conversion.unlockDate)}
                </div>

                {conversion.actualUnlockDate && (
                  <>
                    <div className="text-gray-600">Actual Unlock Date:</div>
                    <div>{formatDate(conversion.actualUnlockDate)}</div>
                  </>
                )}
              </div>

              <div className="flex justify-end mt-3">
                <button
                  onClick={() => handleUnlock(conversion.id)}
                  className={`px-4 py-2 text-sm rounded-md ${
                    canUnlock(conversion)
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!canUnlock(conversion) || processingId === conversion.id}
                >
                  {processingId === conversion.id
                    ? "Processing..."
                    : canUnlock(conversion)
                      ? "Unlock Funds"
                      : conversion.status === "UNLOCKED"
                        ? "Already Unlocked"
                        : "Locked"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
