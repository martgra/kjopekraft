'use client'

import { Suspense } from 'react'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint, SalaryStatistics } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { createTestId } from '@/lib/testing/testIds'
import OnboardingEmptyState from '@/features/onboarding/OnboardingEmptyState'
import { MetricGridSkeleton, ChartSkeleton } from '@/components/ui/skeletons'
import { Notice, SectionHeader } from '@/components/ui/atoms'
import { PageShell } from '@/components/ui/layout'
import MetricGrid from './MetricGrid'
import ChartSection from './ChartSection'
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
  const shouldShowMetrics = hasData && showMetricGrid

  const handleDemoCta = () => {
    onClearDemo()
    onRequestAdd()
  }

  return (
    <PageShell className="gap-3 md:gap-6" data-testid={dashboardTestId('root')}>
      {showHeader && (
        <SectionHeader
          title={TEXT.dashboard.annualOverview}
          subtitle={TEXT.dashboard.annualOverviewSubtitle}
        />
      )}

      {!inflationData.length ? (
        <Notice variant="warning" className="rounded-2xl px-4 py-3">
          <div className="font-semibold">{TEXT.inflation.noDataTitle}</div>
          <p className="mt-1 text-[11px]">{TEXT.inflation.noDataMessage}</p>
        </Notice>
      ) : null}

      {hasData && (
        <>
          <StatusBanner
            payPoints={payPoints}
            statistics={statistics}
            isDemoMode={isDemoMode}
            onSinglePointCtaClick={onRequestAdd}
            onDemoModeCtaClick={handleDemoCta}
          />
          {shouldShowMetrics && (
            <Suspense fallback={<MetricGridSkeleton />}>
              <MetricGrid statistics={statistics} isNetMode={isNetMode} />
            </Suspense>
          )}
        </>
      )}

      {hasData ? (
        <div className={chartWrapperClasses}>
          <Suspense fallback={<ChartSkeleton className="ui-surface w-full rounded-xl shadow-sm" />}>
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
    </PageShell>
  )
}
