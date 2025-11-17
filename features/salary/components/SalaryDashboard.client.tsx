// features/salary/components/SalaryDashboard.client.tsx
'use client'

import React from 'react'
import ResponsiveChartWrapper from '@/features/visualization/components/ResponsiveChartWrapper'
import MobilePayChart from '@/features/visualization/components/MobilePayChart'
import DesktopPayChart from '@/features/visualization/components/DesktopPayChart'
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
    <div className="relative w-full rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      {payPoints.length < 2 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm">
          <p className="px-4 text-center text-lg text-neutral-600">{TEXT.dashboard.noData}</p>
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

      {/* Mode Toggle */}
      <div className="mt-6 flex items-center justify-center space-x-3 rounded-lg bg-neutral-50 p-4">
        <span
          className={`text-sm font-medium ${!displayNet ? 'text-primary-600' : 'text-neutral-500'}`}
        >
          Bruttolønn
        </span>

        <button
          onClick={onToggleDisplay}
          className="focus:ring-primary-500 relative inline-flex h-6 w-11 items-center rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none"
          aria-pressed={displayNet}
        >
          <span className="sr-only">
            {displayNet ? 'Bytt til bruttolønn' : 'Bytt til nettolønn'}
          </span>
          <div
            className={`absolute inset-0 rounded-full transition-colors duration-200 ${
              displayNet ? 'bg-primary-600' : 'bg-neutral-300'
            }`}
          />
          <div
            className={`absolute h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              displayNet ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>

        <span
          className={`text-sm font-medium ${displayNet ? 'text-primary-600' : 'text-neutral-500'}`}
        >
          Nettolønn
        </span>
      </div>
    </div>
  )
}
