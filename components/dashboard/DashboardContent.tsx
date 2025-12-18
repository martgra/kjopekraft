'use client'

import { Suspense } from 'react'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint, SalaryStatistics } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { createTestId } from '@/lib/testing/testIds'
import OnboardingEmptyState from '@/features/onboarding/OnboardingEmptyState'
import { MetricGridSkeleton, ChartSkeleton } from '@/components/ui/skeletons'
import MetricGrid from './MetricGrid'
import ChartSection from './ChartSection'
import DemoDataBanner from './DemoDataBanner'
import StatusBanner from './StatusBanner'

interface DashboardContentProps {
  payPoints: PayPoint[]
  statistics: SalaryStatistics
  inflationData: InflationDataPoint[]
  currentYear: number
  hasData: boolean
  isDemoMode: boolean
  isNetMode: boolean
  onToggleMode: () => void
  onLoadDemo: () => void
  onClearDemo: () => void
  onEditPoint: (point: PayPoint) => void
  onRemovePoint: (year: number, pay: number) => void
  onRequestAdd: () => void
  showHeader?: boolean
  showMetricGrid?: boolean
  chartWrapperClassName?: string
}

export default function DashboardContent({
  payPoints,
  statistics,
  inflationData,
  currentYear,
  hasData,
  isDemoMode,
  isNetMode,
  onToggleMode,
  onLoadDemo,
  onClearDemo,
  onEditPoint,
  onRemovePoint,
  onRequestAdd,
  showHeader = true,
  showMetricGrid = true,
  chartWrapperClassName = '',
}: DashboardContentProps) {
  const dashboardTestId = createTestId('dashboard')
  const chartWrapperClasses = `flex min-h-[350px] flex-1 ${chartWrapperClassName}`.trim()

  return (
    <div className="flex min-h-full flex-col gap-6" data-testid={dashboardTestId('root')}>
      {showHeader && (
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[var(--text-main)] md:text-3xl">
            {TEXT.dashboard.annualOverview}
          </h1>
          <p className="text-sm text-[var(--text-muted)] md:mt-1">
            {TEXT.dashboard.annualOverviewSubtitle}
          </p>
        </div>
      )}

      {hasData && (
        <>
          {isDemoMode && <DemoDataBanner onClearDemo={onClearDemo} />}
          <StatusBanner statistics={statistics} />
          {showMetricGrid && (
            <Suspense fallback={<MetricGridSkeleton />}>
              <MetricGrid statistics={statistics} isNetMode={isNetMode} />
            </Suspense>
          )}
        </>
      )}

      {hasData ? (
        <div className={chartWrapperClasses}>
          <Suspense fallback={<ChartSkeleton className="w-full rounded-xl bg-white shadow-sm" />}>
            <ChartSection
              payPoints={payPoints}
              inflationData={inflationData}
              currentYear={currentYear}
              isNetMode={isNetMode}
              onToggleMode={onToggleMode}
              onRequestAdd={onRequestAdd}
              onEditPayPoint={onEditPoint}
              onRemovePayPoint={onRemovePoint}
            />
          </Suspense>
        </div>
      ) : (
        <OnboardingEmptyState onLoadDemo={onLoadDemo} onOpenDrawer={onRequestAdd} />
      )}
    </div>
  )
}
