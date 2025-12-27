'use client'

import { useEffect } from 'react'
import NegotiationPage from './NegotiationPage'
import { useDrawer } from '@/contexts/drawer/DrawerContext'
import { useNegotiationData } from '../hooks/useNegotiationData'
import type { InflationDataPoint } from '@/domain/inflation'
import { SalaryDataProvider } from '@/features/salary/providers/SalaryDataProvider'
import { DemoModeProvider } from '@/contexts/demoMode/DemoModeContext'

interface NegotiationClientPageProps {
  inflationData: InflationDataPoint[]
}

export default function NegotiationClientPage({ inflationData }: NegotiationClientPageProps) {
  const currentYear = new Date().getFullYear()
  const { isOpen, closeDrawer, setNegotiationPointsCount } = useDrawer()
  const { points } = useNegotiationData()

  useEffect(() => {
    setNegotiationPointsCount(points.length)
  }, [points.length, setNegotiationPointsCount])

  return (
    <SalaryDataProvider inflationData={inflationData} currentYear={currentYear}>
      <DemoModeProvider>
        <NegotiationPage
          inflationData={inflationData}
          currentYear={currentYear}
          isDrawerOpen={isOpen}
          onDrawerClose={closeDrawer}
        />
      </DemoModeProvider>
    </SalaryDataProvider>
  )
}
