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
  isNetMode: boolean
  onToggleMode: () => void
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
  isNetMode,
  onToggleMode,
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
            onSinglePointCtaClick={onRequestAdd}
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
        <OnboardingEmptyState onOpenDrawer={onRequestAdd} />
      )}
    </PageShell>
  )
}
