'use client'

import { useEffect } from 'react'
import Dashboard from './Dashboard'
import { useDrawer } from '@/contexts/drawer/DrawerContext'
import type { InflationDataPoint } from '@/lib/models/inflation'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'

interface DashboardWithDrawerProps {
  inflationData: InflationDataPoint[]
  currentYear: number
}

export default function DashboardWithDrawer({
  inflationData,
  currentYear,
}: DashboardWithDrawerProps) {
  const { isOpen, closeDrawer, setPointsCount } = useDrawer()
  const { payPoints } = useSalaryData(inflationData, currentYear)

  // Update points count for the FAB badge
  useEffect(() => {
    setPointsCount(payPoints.length)
  }, [payPoints.length, setPointsCount])

  return (
    <Dashboard
      inflationData={inflationData}
      currentYear={currentYear}
      isDrawerOpen={isOpen}
      onDrawerClose={closeDrawer}
    />
  )
}
