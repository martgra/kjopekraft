'use client'

import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'
import { useState, useEffect } from 'react'
import SalaryStats from '@/features/salary/components/SalaryStats'
import SalaryDashboard from '@/features/salary/components/SalaryDashboard.client'
import DataEntryGuide from '@/features/onboarding/components/DataEntryGuide.client'
import { TEXT } from '@/lib/constants/text'
import type { InflationDataPoint } from '@/lib/models/inflation'
import type { PayPoint } from '@/lib/models/types'
import { TabBar } from '@/components/ui/common/TabBar'

interface HomeClientProps {
  inflationData: InflationDataPoint[]
}

export function HomeClient({ inflationData }: HomeClientProps) {
  const {
    payPoints,
    statistics,
    hasData,
    addPoint,
    editPoint,
    removePoint,
    validatePoint,
    isLoading,
    error,
  } = useSalaryData(inflationData)

  const { isNetMode, toggleMode } = useDisplayMode()

  const [activeTab, setActiveTab] = useState<'chart' | 'edit'>('chart')
  const [initialTabSet, setInitialTabSet] = useState(false)

  // Wrapper functions to match DataEntryGuide's expected types
  const handleAddPoint = (point: PayPoint) => {
    addPoint(point)
    return validatePoint(point)
  }

  const handleEditPoint = (oldPoint: PayPoint, newPoint: PayPoint) => {
    editPoint(oldPoint.year, oldPoint.pay, newPoint)
    return validatePoint(newPoint)
  }

  useEffect(() => {
    if (!initialTabSet && !isLoading) {
      setActiveTab(payPoints.length >= 2 ? 'chart' : 'edit')
      setInitialTabSet(true)
    }
  }, [initialTabSet, payPoints.length, isLoading])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-12">
        <p className="text-base">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-12">
        <p className="text-base text-red-600">{TEXT.common.error}</p>
      </div>
    )
  }

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
      <header className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-6xl">
          {TEXT.dashboard.title}
        </h1>
      </header>

      <div className="w-full">
        <SalaryStats {...displayStats} />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[300px]">
          <TabBar
            tabs={tabs}
            active={activeTab}
            onChange={k => setActiveTab(k as 'chart' | 'edit')}
          />
        </div>
      </div>

      <div className="w-full">
        {activeTab === 'chart' ? (
          <SalaryDashboard
            payPoints={payPoints}
            inflationData={inflationData}
            displayNet={isNetMode}
            onToggleDisplay={toggleMode}
          />
        ) : (
          <DataEntryGuide
            payPoints={payPoints}
            onAdd={handleAddPoint}
            onRemove={pt => removePoint(pt.year, pt.pay)}
            onEdit={handleEditPoint}
            validatePoint={validatePoint}
            inflationData={inflationData}
          />
        )}
      </div>
    </div>
  )
}
