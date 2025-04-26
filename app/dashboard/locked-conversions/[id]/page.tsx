import Link from "next/link"
import ConversionDetails from "@/components/ConversionDetails"

export default function ConversionDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/locked-conversions" className="text-blue-600 hover:underline mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Conversion Details</h1>
      </div>
      <ConversionDetails conversionId={params.id} />
    </div>
  )
}
