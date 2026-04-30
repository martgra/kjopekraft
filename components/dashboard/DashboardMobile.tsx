'use client'

import MobileAddSalarySheet from './MobileAddSalarySheet'
import SalaryListCard from './SalaryListCard'
import SimpleChartCard from './SimpleChartCard'
import OnboardingEmptyState from '@/features/onboarding/OnboardingEmptyState'
import MobileTopBar from './MobileTopBar'
import MobileSalaryHero from './MobileSalaryHero'
import NegotiationCtaCard from './NegotiationCtaCard'
import FloatingAddButton from './FloatingAddButton'
import { pageTheme, SANS } from '@/lib/constants/designTokens'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint, PayChangeReason, SalaryStatistics } from '@/domain/salary'

interface DashboardMobileProps {
  payPoints: PayPoint[]
  statistics: SalaryStatistics
  inflationData: InflationDataPoint[]
  currentYear: number
  hasData: boolean
  isNetMode: boolean
  isDrawerOpen: boolean
  editingPoint: PayPoint | null

  // Unused legacy form state, kept for Dashboard.tsx compatibility
  newYear: string
  newPay: string
  newReason: PayChangeReason | ''
  newNote: string
  minYear: number
  validationError: string
  isSubmitDisabled: boolean

  onDrawerOpen: () => void
  onDrawerClose: () => void
  onToggleMode: () => void
  onEditPoint: (point: PayPoint) => void
  onRemovePoint: (year: number, pay: number) => void
  onSavePoint: (data: PayPoint) => void
  onDeletePoint: (point: PayPoint) => void

  // Unused legacy handlers
  onYearChange: (year: string) => void
  onPayChange: (pay: string) => void
  onReasonChange: (reason: PayChangeReason | '') => void
  onNoteChange: (note: string) => void
  onSubmitPoint: () => void
}

export default function DashboardMobile({
  payPoints,
  inflationData,
  statistics,
  currentYear,
  hasData,
  isNetMode,
  isDrawerOpen,
  editingPoint,
  onDrawerOpen,
  onDrawerClose,
  onToggleMode,
  onEditPoint,
  onSavePoint,
  onDeletePoint,
}: DashboardMobileProps) {
  return (
    <>
      <MobileAddSalarySheet
        open={isDrawerOpen}
        onClose={onDrawerClose}
        onSave={onSavePoint}
        onDelete={onDeletePoint}
        editingPoint={editingPoint}
        payPoints={payPoints}
        currentYear={currentYear}
        isNetMode={isNetMode}
      />

      <div style={{
        ...pageTheme,
        background: 'var(--paper)',
        position: 'relative',
        minHeight: '100vh',
        fontFamily: SANS,
        color: 'var(--ink)',
        paddingBottom: 100,
      }}>
        {hasData ? (
          <>
            <MobileTopBar />
            <MobileSalaryHero
              payPoints={payPoints}
              statistics={statistics}
              currentYear={currentYear}
              isNetMode={isNetMode}
              onToggleMode={onToggleMode}
            />

            <div style={{ margin: '16px 16px 0' }}>
              <NegotiationCtaCard currentYear={currentYear} variant="mobile" />
            </div>

            <div style={{ padding: '16px 16px 0' }}>
              <SimpleChartCard
                payPoints={payPoints}
                inflationData={inflationData}
                currentYear={currentYear}
                isNetMode={isNetMode}
                height={200}
                padding="14px"
              />
            </div>

            <SalaryListCard payPoints={payPoints} onEditPoint={onEditPoint} />

            <FloatingAddButton onClick={onDrawerOpen} />
          </>
        ) : (
          <div style={{ padding: '20px 16px' }}>
            <OnboardingEmptyState onOpenDrawer={onDrawerOpen} />
          </div>
        )}
      </div>
    </>
  )
}
