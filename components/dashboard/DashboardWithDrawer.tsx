'use client'

import { useEffect } from 'react'
import Dashboard from './Dashboard'
import { useDrawer } from '@/contexts/drawer/DrawerContext'
import type { InflationDataPoint } from '@/domain/inflation'
import {
  SalaryDataProvider,
  useSalaryDataContext,
} from '@/features/salary/providers/SalaryDataProvider'

interface DashboardWithDrawerProps {
  inflationData: InflationDataPoint[]
  currentYear: number
}

export default function DashboardWithDrawer({
  inflationData,
  currentYear,
}: DashboardWithDrawerProps) {
  return (
    <SalaryDataProvider inflationData={inflationData} currentYear={currentYear}>
      <DashboardWithContext inflationData={inflationData} currentYear={currentYear} />
    </SalaryDataProvider>
  )
}

function DashboardWithContext({
  inflationData,
  currentYear,
}: {
  inflationData: InflationDataPoint[]
  currentYear: number
}) {
  const { isOpen, openDrawer, closeDrawer, setDashboardPointsCount } = useDrawer()
  const { payPoints } = useSalaryDataContext()

  useEffect(() => {
    setDashboardPointsCount(payPoints.length)
  }, [payPoints.length, setDashboardPointsCount])

  return (
    <Dashboard
      inflationData={inflationData}
      currentYear={currentYear}
      isDrawerOpen={isOpen}
      onDrawerOpen={openDrawer}
      onDrawerClose={closeDrawer}
    />
  )
}
