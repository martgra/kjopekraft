'use client'

import PayChart, { type PayChartBaseProps } from './PayChart'

export default function DesktopPayChart(props: PayChartBaseProps) {
  return <PayChart {...props} variant="desktop" />
}
