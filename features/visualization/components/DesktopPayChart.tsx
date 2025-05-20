// components/charts/DesktopPayChart.tsx
'use client'

import React from 'react'
import PaypointChart from './PaypointChart'
import type { PayPoint } from '@/lib/models/salary'
import type { InflationDataPoint } from '@/lib/models/inflation'

interface DesktopPayChartProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  displayNet: boolean
}

export default function DesktopPayChart({
  payPoints,
  inflationData,
  displayNet,
}: DesktopPayChartProps) {
  return (
    <PaypointChart
      payPoints={payPoints}
      inflationData={inflationData}
      displayNet={displayNet}
      className="h-96 w-full"
    />
  )
}
