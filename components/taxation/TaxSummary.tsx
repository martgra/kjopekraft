import React, { useState } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

interface TaxRecord {
  year: number
  gross: number
  tax: number
  net: number
}

interface TaxSummaryProps {
  taxData: TaxRecord[]
}

export default function TaxSummary({ taxData }: TaxSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (taxData.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium">Skatteberegning per år</h3>
        <button className="text-gray-600 hover:text-gray-900">
          {isExpanded ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {isExpanded && (
        <ul className="mt-2 space-y-1 text-sm text-gray-700">
          {taxData.map(({ year, gross, tax, net }) => (
            <li key={year}>
              <strong>{year}:</strong> Brutto {gross.toLocaleString()} NOK,&nbsp; Skatt{' '}
              {tax.toLocaleString()} NOK,&nbsp; Netto {net.toLocaleString()} NOK
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
