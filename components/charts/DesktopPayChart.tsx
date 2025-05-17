'use client'

import React from 'react'
import PaypointChart from './PaypointChart'
import { PayPoint } from '@/lib/models/salary'
import { InflationDataPoint } from '@/lib/models/inflation'

interface DesktopPayChartProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
}

export default function DesktopPayChart(props: DesktopPayChartProps) {
  return <PaypointChart {...props} className="h-96 w-full" />
}
