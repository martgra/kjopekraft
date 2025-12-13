'use client'

import { useEffect } from 'react'
import Dashboard from './Dashboard'
import { useDrawer } from '@/contexts/drawer/DrawerContext'
import type { InflationDataPoint } from '@/domain/inflation'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'

interface DashboardWithDrawerProps {
  inflationData: InflationDataPoint[]
  currentYear: number
}

export default function DashboardWithDrawer({
  inflationData,
  currentYear,
}: DashboardWithDrawerProps) {
  const { isOpen, openDrawer, closeDrawer, setDashboardPointsCount } = useDrawer()
  const { payPoints } = useSalaryData(inflationData, currentYear)

  // Update points count for the FAB badge
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
