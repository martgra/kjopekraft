// components/dashboard/SalaryDashboard.client.tsx
'use client'

import React from 'react'
import ResponsiveChartWrapper from '@/components/ui/ResponsiveChartWrapper'
import MobilePayChart from '@/components/charts/MobilePayChart'
import DesktopPayChart from '@/components/charts/DesktopPayChart'
import { TEXT } from '@/lib/constants/text'
import type { PayPoint } from '@/lib/models/salary'
import type { InflationDataPoint } from '@/lib/models/inflation'

interface SalaryDashboardProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  displayNet: boolean
  onToggleDisplay: () => void
}

export default function SalaryDashboard({
  payPoints,
  inflationData,
  displayNet,
  onToggleDisplay,
}: SalaryDashboardProps) {
  return (
    <div className="relative mt-8 w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl">
      {payPoints.length < 2 && (
        <div className="bg-opacity-75 absolute inset-0 z-10 flex items-center justify-center bg-white">
          <p className="px-4 text-center text-lg text-gray-500">{TEXT.dashboard.noData}</p>
        </div>
      )}

      <ResponsiveChartWrapper
        mobileBreakpoint={768}
        mobileView={
          <MobilePayChart
            payPoints={payPoints}
            inflationData={inflationData}
            displayNet={displayNet}
          />
        }
        className="h-[450px] w-full"
      >
        <DesktopPayChart
          payPoints={payPoints}
          inflationData={inflationData}
          displayNet={displayNet}
        />
      </ResponsiveChartWrapper>

      {/* Mode Toggle - Moved below chart */}
      <div className="mt-4 flex items-center justify-center space-x-2 rounded-lg bg-gray-50 p-3">
        <span className={`text-sm ${!displayNet ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
          Bruttolønn
        </span>

        <button
          onClick={onToggleDisplay}
          className="relative inline-flex h-6 w-11 items-center rounded-full"
          aria-pressed={displayNet}
        >
          <span className="sr-only">
            {displayNet ? 'Bytt til bruttolønn' : 'Bytt til nettolønn'}
          </span>
          <div
            className={`absolute inset-0 rounded-full transition-colors duration-200 ${
              displayNet ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
          <div
            className={`absolute h-4 w-4 transform rounded-full bg-white transition ${
              displayNet ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>

        <span className={`text-sm ${displayNet ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
          Nettolønn
        </span>
      </div>
    </div>
  )
}
