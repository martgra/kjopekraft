'use client'

import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint, SalaryStatistics } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { pageTheme, SANS } from '@/lib/constants/designTokens'
import { createTestId } from '@/lib/testing/testIds'
import OnboardingEmptyState from '@/features/onboarding/OnboardingEmptyState'
import { Notice } from '@/components/ui/atoms'
import DashboardHero from './DashboardHero'
import DashboardTopBar from './DashboardTopBar'
import SalaryListTable from './SalaryListTable'
import SimpleChartCard from './SimpleChartCard'

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
}: DashboardContentProps) {
  const dashboardTestId = createTestId('dashboard')

  return (
    <div
      style={{
        ...pageTheme,
        padding: '28px 36px 60px',
        background: 'var(--paper)',
        minHeight: '100vh',
        fontFamily: SANS,
        color: 'var(--ink)',
      }}
      data-testid={dashboardTestId('root')}
    >
      {!inflationData.length ? (
        <Notice variant="warning" className="mb-4 rounded-2xl px-4 py-3">
          <div className="font-semibold">{TEXT.inflation.noDataTitle}</div>
          <p className="mt-1 text-[11px]">{TEXT.inflation.noDataMessage}</p>
        </Notice>
      ) : null}

      {hasData ? (
        <>
          <DashboardTopBar
            isNetMode={isNetMode}
            onToggleMode={onToggleMode}
            onRequestAdd={onRequestAdd}
            showKeyboardHint
          />

          <DashboardHero statistics={statistics} currentYear={currentYear} />

          <SimpleChartCard
            payPoints={payPoints}
            inflationData={inflationData}
            currentYear={currentYear}
            isNetMode={isNetMode}
          />

          <SalaryListTable
            payPoints={payPoints}
            onEditPoint={onEditPoint}
            onRemovePoint={onRemovePoint}
          />
        </>
      ) : (
        <OnboardingEmptyState onOpenDrawer={onRequestAdd} />
      )}
    </div>
  )
}
