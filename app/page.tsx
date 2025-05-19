'use client'

import { useState, useEffect } from 'react'
import { TabBar } from '@/components/ui/TabBar'
import SalaryStats from '@/components/stats/SalaryStats'
import SalaryDashboard from '@/components/dashboard/SalaryDashboard.client'
import DataEntryGuide from '@/components/onboarding/DataEntryGuide.client'
import { TEXT } from '@/lib/constants/text'
import { useInflation } from '@/features/inflation/hooks/useInflation'
import { useSalaryPoints } from '@/features/paypoints/hooks/useSalaryPoints'
import { useSalaryCalculations } from '@/features/paypoints/hooks/useSalaryCalculations'

export default function Home() {
  // Shared data hooks
  const { data: inflationData = [], error: infError, isLoading: infLoading } = useInflation()
  const {
    payPoints,
    addPoint,
    removePoint,
    editPoint,
    validatePoint,
    isLoading: ptsLoading,
  } = useSalaryPoints(inflationData)
  const {
    statistics,
    hasData,
    isLoading: statsLoading,
  } = useSalaryCalculations(payPoints, inflationData)

  const [activeTab, setActiveTab] = useState<'chart' | 'edit'>('chart')
  const [initialTabSet, setInitialTabSet] = useState(false)

  // Initialize activeTab once after loading
  useEffect(() => {
    if (!initialTabSet && !infLoading && !ptsLoading) {
      setActiveTab(payPoints.length >= 2 ? 'chart' : 'edit')
      setInitialTabSet(true)
    }
  }, [infLoading, ptsLoading, initialTabSet, payPoints.length])

  // Global loading or error
  if (infLoading || ptsLoading || statsLoading) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-12">
        <p className="text-base text-gray-500">{TEXT.common.loadingData}</p>
      </div>
    )
  }
  if (infError) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-12">
        <p className="text-base text-red-600">{TEXT.common.error}</p>
      </div>
    )
  }

  // Prepare stats display once data is ready
  const displayStats = {
    startingPay: hasData ? statistics.startingPay : '--',
    latestPay: hasData ? statistics.latestPay : '--',
    inflationAdjustedPay: hasData ? statistics.inflationAdjustedPay : '--',
    gapPercent: hasData ? statistics.gapPercent : '--',
  }

  const tabs = [
    { key: 'edit', label: <>✏️ {TEXT.forms.yourPoints}</> },
    { key: 'chart', label: <>📈 {TEXT.charts.payDevelopmentTitle}</> },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:space-y-12 sm:px-6 lg:px-8">
      {/* Page title */}
      <header className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-6xl">
          {TEXT.dashboard.title}
        </h1>
      </header>

      {/* Live stats */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
        <div className="w-full sm:w-auto">
          <SalaryStats
            startingPay={displayStats.startingPay}
            latestPay={displayStats.latestPay}
            inflationAdjustedPay={displayStats.inflationAdjustedPay}
            gapPercent={displayStats.gapPercent}
          />
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="overflow-x-auto">
        <div className="min-w-[300px]">
          <TabBar
            tabs={tabs}
            active={activeTab}
            onChange={key => setActiveTab(key as 'chart' | 'edit')}
          />
        </div>
      </div>

      {/* Main content panels */}
      <div className="w-full">
        {activeTab === 'chart' ? (
          <SalaryDashboard payPoints={payPoints} inflationData={inflationData} />
        ) : (
          <DataEntryGuide
            payPoints={payPoints}
            onAdd={addPoint}
            onRemove={pt => removePoint(pt.year, pt.pay)}
            onEdit={(oldPt, newPt) => editPoint(oldPt.year, oldPt.pay, newPt)}
            validatePoint={validatePoint}
            inflationData={inflationData}
          />
        )}
      </div>
    </div>
  )
}
