"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

type Wallet = {
  id: string
  name: string
  currency: string
  balance: number
}

export default function LockedConversionForm() {
  const router = useRouter()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const [sourceWalletId, setSourceWalletId] = useState("")
  const [targetWalletId, setTargetWalletId] = useState("")
  const [amount, setAmount] = useState("")
  const [lockPeriodMonths, setLockPeriodMonths] = useState(3)
  const [currentRate, setCurrentRate] = useState<number | null>(null)
  const [feeAmount, setFeeAmount] = useState<number>(0)
  const [netAmount, setNetAmount] = useState<number>(0)
  const [convertedAmount, setConvertedAmount] = useState<number>(0)

  // Fetch wallets
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await axios.get("/api/wallets")
        setWallets(response.data.wallets)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch wallets")
        setLoading(false)
      }
    }

    fetchWallets()
  }, [])

  // Update rate when source or target wallet changes
  useEffect(() => {
    const fetchRate = async () => {
      if (sourceWalletId && targetWalletId) {
        const sourceWallet = wallets.find((w) => w.id === sourceWalletId)
        const targetWallet = wallets.find((w) => w.id === targetWalletId)

        if (sourceWallet && targetWallet) {
          try {
            const API_KEY = "2878e8f7f080a3a887021fe1956030f1"
            const baseUrl = "https://api.exchangerate.host/live"

            const response = await axios.get(baseUrl, {
              params: {
                access_key: API_KEY,
                format: 1,
                source: sourceWallet.currency,
                currencies: targetWallet.currency,
              },
            })

            const rateKey = `${sourceWallet.currency}${targetWallet.currency}`
            const rate = response.data.quotes[rateKey]
            setCurrentRate(rate)

            // Update calculations if amount is set
            if (amount) {
              const amountValue = Number.parseFloat(amount)
              const fee = amountValue * 0.03
              const net = amountValue - fee
              const converted = net * rate

              setFeeAmount(fee)
              setNetAmount(net)
              setConvertedAmount(converted)
            }
          } catch (err) {
            setError("Failed to fetch exchange rate")
          }
        }
      }
    }

    fetchRate()
  }, [sourceWalletId, targetWalletId, wallets, amount])

  // Update calculations when amount changes
  useEffect(() => {
    if (amount && currentRate) {
      const amountValue = Number.parseFloat(amount)
      const fee = amountValue * 0.03
      const net = amountValue - fee
      const converted = net * currentRate

      setFeeAmount(fee)
      setNetAmount(net)
      setConvertedAmount(converted)
    } else {
      setFeeAmount(0)
      setNetAmount(0)
      setConvertedAmount(0)
    }
  }, [amount, currentRate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await axios.post("/api/wallets/locked-conversions", {
        sourceWalletId,
        targetWalletId,
        sourceAmount: Number.parseFloat(amount),
        lockPeriodMonths,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/locked-conversions")
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create locked conversion")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-6">Loading wallets...</div>
  }

  if (success) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="text-green-800 font-medium">Conversion Locked Successfully!</h3>
        <p className="text-green-600 mt-2">
          Your funds have been locked for {lockPeriodMonths} months at the current exchange rate. Redirecting to locked
          conversions...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Lock Currency Conversion</h2>
      {error && (
        <div className="bg-red-50 p-3 rounded-md border border-red-200 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Source Wallet</label>
          <select
            value={sourceWalletId}
            onChange={(e) => setSourceWalletId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select source wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name} ({wallet.currency}) - Balance: {wallet.balance.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Wallet</label>
          <select
            value={targetWalletId}
            onChange={(e) => setTargetWalletId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
            disabled={!sourceWalletId}
          >
            <option value="">Select target wallet</option>
            {wallets
              .filter((w) => w.id !== sourceWalletId)
              .map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} ({wallet.currency})
                </option>
              ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Convert</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
              disabled={!sourceWalletId || !targetWalletId}
            />
            {sourceWalletId && (
              <span className="absolute right-3 top-2 text-gray-500">
                {wallets.find((w) => w.id === sourceWalletId)?.currency}
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Lock Period (Months)</label>
          <input
            type="range"
            min="3"
            max="24"
            value={lockPeriodMonths}
            onChange={(e) => setLockPeriodMonths(Number.parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>3 months</span>
            <span>{lockPeriodMonths} months</span>
            <span>24 months</span>
          </div>
        </div>

        {currentRate && amount && (
          <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="font-medium text-gray-700 mb-2">Conversion Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Current Exchange Rate:</div>
              <div className="font-medium">
                1 {wallets.find((w) => w.id === sourceWalletId)?.currency} = {currentRate.toFixed(4)}{" "}
                {wallets.find((w) => w.id === targetWalletId)?.currency}
              </div>

              <div className="text-gray-600">Amount:</div>
              <div className="font-medium">
                {Number.parseFloat(amount).toFixed(2)} {wallets.find((w) => w.id === sourceWalletId)?.currency}
              </div>

              <div className="text-gray-600">Transaction Fee (3%):</div>
              <div className="font-medium text-amber-600">
                -{feeAmount.toFixed(2)} {wallets.find((w) => w.id === sourceWalletId)?.currency}
              </div>

              <div className="text-gray-600">Net Amount:</div>
              <div className="font-medium">
                {netAmount.toFixed(2)} {wallets.find((w) => w.id === sourceWalletId)?.currency}
              </div>

              <div className="text-gray-600">Converted Amount:</div>
              <div className="font-medium text-green-600">
                {convertedAmount.toFixed(2)} {wallets.find((w) => w.id === targetWalletId)?.currency}
              </div>

              <div className="text-gray-600">Lock Period:</div>
              <div className="font-medium">{lockPeriodMonths} months</div>

              <div className="text-gray-600">Unlock Date:</div>
              <div className="font-medium">
                {new Date(new Date().setMonth(new Date().getMonth() + lockPeriodMonths)).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          disabled={submitting || !sourceWalletId || !targetWalletId || !amount || Number.parseFloat(amount) <= 0}
        >
          {submitting ? "Processing..." : "Lock Conversion"}
        </button>
      </form>
    </div>
  )
}
