// components/charts/MobilePayChart.tsx
'use client'

import React from 'react'
import PaypointChart from './PaypointChart'
import type { PayPoint } from '@/lib/models/salary'
import type { InflationDataPoint } from '@/lib/models/inflation'

interface MobilePayChartProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  displayNet: boolean
}

export default function MobilePayChart({
  payPoints,
  inflationData,
  displayNet,
}: MobilePayChartProps) {
  return (
    <PaypointChart
      payPoints={payPoints}
      inflationData={inflationData}
      displayNet={displayNet}
      className="h-64 w-full"
    />
  )
}
