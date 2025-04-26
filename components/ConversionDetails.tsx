"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

type ConversionDetailsProps = {
  conversionId: string
}

export default function ConversionDetails({ conversionId }: ConversionDetailsProps) {
  const router = useRouter()
  const [details, setDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)

  useEffect(() => {
    fetchConversionDetails()
  }, [conversionId])

  const fetchConversionDetails = async () => {
    try {
      const response = await axios.get(`/api/wallets/locked-conversions/${conversionId}`)
      setDetails(response.data)
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch conversion details")
      setLoading(false)
    }
  }

  const handleUnlock = async () => {
    try {
      setUnlocking(true)
      await axios.post(`/api/wallets/locked-conversions/${conversionId}/unlock`)
      await fetchConversionDetails()
      router.refresh()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to unlock conversion")
    } finally {
      setUnlocking(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (loading) {
    return <div className="text-center py-6">Loading conversion details...</div>
  }

  if (!details || !details.lockedConversion) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-600 mt-2">{error || "Failed to load conversion details"}</p>
      </div>
    )
  }

  const { lockedConversion, currentRate, rateDifference, canUnlock } = details

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Locked Conversion Details</h2>
        <span
          className={`px-3 py-1 text-sm rounded-full ${
            lockedConversion.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : lockedConversion.status === "UNLOCKED"
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {lockedConversion.status}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 p-3 rounded-md border border-red-200 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 text-sm">From</p>
            <p className="text-xl font-semibold my-1">{lockedConversion.sourceAmount.toFixed(2)}</p>
            <p className="text-gray-700">{lockedConversion.sourceCurrency}</p>
          </div>
          <div className="text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">To</p>
            <p className="text-xl font-semibold my-1">{lockedConversion.targetAmount.toFixed(2)}</p>
            <p className="text-gray-700">{lockedConversion.targetCurrency}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">Conversion Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Source Wallet:</span>
              <span>{lockedConversion.sourceWallet.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Target Wallet:</span>
              <span>{lockedConversion.targetWallet.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction Fee:</span>
              <span className="text-amber-600">
                {lockedConversion.fee.toFixed(2)} {lockedConversion.sourceCurrency} ({lockedConversion.feePercentage}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Amount:</span>
              <span>
                {(lockedConversion.sourceAmount - lockedConversion.fee).toFixed(2)} {lockedConversion.sourceCurrency}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">Rate Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Locked Rate:</span>
              <span className="font-medium">
                1 {lockedConversion.sourceCurrency} = {lockedConversion.exchangeRate.toFixed(4)}{" "}
                {lockedConversion.targetCurrency}
              </span>
            </div>

            {lockedConversion.status === "ACTIVE" && currentRate && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Rate:</span>
                  <span className="font-medium">
                    1 {lockedConversion.sourceCurrency} = {currentRate.toFixed(4)} {lockedConversion.targetCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate Change:</span>
                  <span className={`font-medium ${rateDifference >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {rateDifference.toFixed(2)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Lock Period</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Lock Date:</span>
            <span>{formatDate(lockedConversion.lockDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Unlock Date:</span>
            <span
              className={
                lockedConversion.status === "ACTIVE" && new Date() >= new Date(lockedConversion.unlockDate)
                  ? "text-green-600 font-medium"
                  : ""
              }
            >
              {formatDate(lockedConversion.unlockDate)}
            </span>
          </div>
          {lockedConversion.actualUnlockDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Actual Unlock Date:</span>
              <span>{formatDate(lockedConversion.actualUnlockDate)}</span>
            </div>
          )}

          {lockedConversion.status === "ACTIVE" && (
            <div className="flex justify-between">
              <span className="text-gray-600">Lock Status:</span>
              <span>
                {new Date() >= new Date(lockedConversion.unlockDate)
                  ? "Ready to unlock"
                  : `Locked for ${Math.ceil(
                      (new Date(lockedConversion.unlockDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                    )} more days`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to List
        </button>

        {lockedConversion.status === "ACTIVE" && (
          <button
            onClick={handleUnlock}
            className={`px-4 py-2 text-sm rounded-md ${
              canUnlock ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!canUnlock || unlocking}
          >
            {unlocking ? "Processing..." : canUnlock ? "Unlock Funds" : "Locked"}
          </button>
        )}
      </div>
    </div>
  )
}
