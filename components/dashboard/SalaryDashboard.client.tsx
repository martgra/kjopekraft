'use client'

import React from 'react'
import { useInflation } from '@/features/inflation/hooks/useInflation'
import { useSalaryPoints } from '@/features/paypoints/hooks/useSalaryPoints'
import { useSalaryCalculations } from '@/features/paypoints/hooks/useSalaryCalculations'
import { TEXT } from '@/lib/constants/text'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ResponsiveChartWrapper from '@/components/ui/ResponsiveChartWrapper'
import MobilePayChart from '@/components/charts/MobilePayChart'
import DesktopPayChart from '@/components/charts/DesktopPayChart'
import PayPointsManager from '@/features/paypoints/PayPointsManager'
import InflationDataDisplay from '@/components/ui/InflationDataDisplay'
import SalaryStats from '@/components/stats/SalaryStats'

export default function SalaryDashboard() {
  // Fetch inflation data via SWR
  const { data: inflationData = [], error: infError, isLoading: infLoading } = useInflation()

  // Manage salary points
  const {
    payPoints,
    addPoint,
    removePoint,
    editPoint,
    resetPoints,
    validatePoint,
    isLoading: ptsLoading,
  } = useSalaryPoints(inflationData)

  // Derive salary statistics
  const {
    statistics,
    hasData,
    isLoading: statsLoading,
  } = useSalaryCalculations(payPoints, inflationData)

  // Global loading or error
  if (infLoading || ptsLoading || statsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="large" text={TEXT.common.loadingData} />
      </div>
    )
  }
  if (infError) {
    return <div>{TEXT.common.error}</div>
  }

  // Prepare stats display
  const displayStats = {
    startingPay: hasData ? statistics.startingPay : '--',
    latestPay: hasData ? statistics.latestPay : '--',
    inflationAdjustedPay: hasData ? statistics.inflationAdjustedPay : '--',
    gapPercent: hasData ? statistics.gapPercent : '--',
  }

  return (
    <section className="flex h-full w-full flex-col items-center space-y-8 bg-gray-50 px-4 py-8 sm:space-y-12 sm:px-6 sm:py-12 md:py-16">
      {/* Header */}
      <header className="flex w-full max-w-5xl items-center justify-center">
        <h2 className="text-center text-2xl font-semibold text-gray-800 sm:text-4xl">
          {TEXT.dashboard.title}
        </h2>
      </header>

      {/* Stats Cards */}
      <div className="w-full max-w-5xl">
        <SalaryStats
          startingPay={displayStats.startingPay}
          latestPay={displayStats.latestPay}
          inflationAdjustedPay={displayStats.inflationAdjustedPay}
          gapPercent={displayStats.gapPercent}
        />
      </div>

      {/* Chart + Input */}
      <div className="flex h-full w-full max-w-5xl flex-col gap-4 sm:gap-6 lg:flex-row">
        {/* Chart area */}
        <div className="flex flex-1 flex-col rounded-xl bg-white shadow-xl">
          <div className="h-full flex-grow p-0">
            <ResponsiveChartWrapper
              mobileBreakpoint={768}
              mobileView={<MobilePayChart payPoints={payPoints} inflationData={inflationData} />}
              className="w-full"
            >
              <DesktopPayChart payPoints={payPoints} inflationData={inflationData} />
            </ResponsiveChartWrapper>
          </div>
        </div>

        {/* Sidebar Input */}
        <aside className="w-full space-y-3 rounded-xl bg-white p-3 shadow-lg sm:space-y-4 sm:p-4 lg:w-1/3">
          <h3 className="text-lg font-medium text-gray-700 sm:text-xl">
            {TEXT.dashboard.addPointsTitle}
          </h3>
          <PayPointsManager
            payPoints={payPoints}
            onAdd={addPoint}
            onRemove={removePoint}
            onEdit={editPoint}
            onReset={resetPoints}
            validatePoint={validatePoint}
            isLoading={ptsLoading}
            inflationData={inflationData}
          />
          <InflationDataDisplay data={inflationData} />
        </aside>
      </div>
    </section>
  )
}
