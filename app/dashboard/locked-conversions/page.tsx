import Link from "next/link"
import LockedConversionsList from "@/components/LockedConversionsList"

export default function LockedConversionsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Locked Currency Conversions</h1>
        <Link
          href="/dashboard/locked-conversions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          New Locked Conversion
        </Link>
      </div>
      <LockedConversionsList />
    </div>
  )
}
