'use client'

import PayChart, { type PayChartBaseProps } from './PayChart'

export default function MobilePayChart(props: PayChartBaseProps) {
  return <PayChart {...props} variant="mobile" />
}
