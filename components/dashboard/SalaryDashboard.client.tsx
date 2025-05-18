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
}

export default function SalaryDashboard({ payPoints, inflationData }: SalaryDashboardProps) {
  return (
    <div className="relative mt-8 w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl">
      {payPoints.length < 2 && (
        <div className="bg-opacity-75 absolute inset-0 z-10 flex items-center justify-center bg-white">
          <p className="px-4 text-center text-lg text-gray-500">{TEXT.dashboard.noData}</p>
        </div>
      )}
      <ResponsiveChartWrapper
        mobileBreakpoint={768}
        mobileView={<MobilePayChart payPoints={payPoints} inflationData={inflationData} />}
        className="h-[450px] w-full"
      >
        <DesktopPayChart payPoints={payPoints} inflationData={inflationData} />
      </ResponsiveChartWrapper>
    </div>
  )
}
