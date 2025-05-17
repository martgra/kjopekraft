'use client'

import React, { useState, useEffect } from 'react'
import { InflationDataPoint } from '@/lib/models/inflation'
import { TEXT } from '@/lib/constants/text'

interface InflationDataDisplayProps {
  data: InflationDataPoint[]
}

export default function InflationDataDisplay({ data: inflationData }: InflationDataDisplayProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  if (!inflationData || inflationData.length === 0) {
    return (
      <div className="mt-6 rounded-md border border-yellow-300 bg-yellow-100 p-4">
        <h3 className="text-sm font-medium text-yellow-900">{TEXT.inflation.noDataTitle}</h3>
        <p className="mt-1 text-sm text-yellow-800">{TEXT.inflation.noDataMessage}</p>
      </div>
    )
  }

  // Sort descending by year and take the latest entry
  const latestData = [...inflationData].sort((a, b) => b.year - a.year)[0]

  return (
    <div className="mt-6 rounded-md border border-blue-300 bg-blue-100 p-4">
      <h3 className="text-sm font-medium text-blue-900">{TEXT.inflation.title}</h3>
      <p className="mt-1 text-sm text-blue-800">
        {TEXT.inflation.latestData
          .replace('{year}', String(latestData.year))
          .replace('{inflation}', latestData.inflation.toFixed(1))}
      </p>
      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-blue-800 hover:text-blue-900 hover:underline focus:outline-none">
          {TEXT.inflation.showAllYears.replace('{count}', String(inflationData.length))}
        </summary>
        <div className="mt-3 rounded-md bg-white shadow-sm md:max-h-48 md:overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="p-1 text-left font-medium">{TEXT.inflation.yearHeader}</th>
                <th className="p-1 text-right font-medium">{TEXT.inflation.inflationHeader}</th>
              </tr>
            </thead>
            <tbody>
              {inflationData
                .slice()
                .sort((a, b) => b.year - a.year)
                .map(item => (
                  <tr
                    key={item.year}
                    className="border-t border-blue-200 transition-colors hover:bg-blue-200"
                  >
                    <td className="p-1 font-medium text-blue-900">{item.year}</td>
                    <td className="p-1 text-right font-medium text-blue-900">
                      {item.inflation.toFixed(1)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
