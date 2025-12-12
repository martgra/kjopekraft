'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MobileBottomDrawer from '@/components/layout/MobileBottomDrawer'
import MetricGrid from './MetricGrid'
import ChartSection from './ChartSection'
import RightPanel from './RightPanel'
import OnboardingEmptyState from '@/features/onboarding/OnboardingEmptyState'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'
import { DEMO_PAY_POINTS } from '@/features/onboarding/demoData'
import { calculateNetIncome } from '@/features/tax/taxCalculator'
import type { InflationDataPoint } from '@/lib/models/inflation'
import type { PayPoint } from '@/lib/models/types'
import { TEXT } from '@/lib/constants/text'

interface DashboardProps {
  inflationData: InflationDataPoint[]
  currentYear: number
  isDrawerOpen: boolean
  onDrawerClose: () => void
}

export default function Dashboard({
  inflationData,
  currentYear,
  isDrawerOpen,
  onDrawerClose,
}: DashboardProps) {
  const { payPoints, statistics, hasData, addPoint, removePoint, validatePoint, isLoading, error } =
    useSalaryData(inflationData, currentYear)

  const { isNetMode, toggleMode } = useDisplayMode()
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false)

  // Form state
  const [newYear, setNewYear] = useState('')
  const [newPay, setNewPay] = useState('')
  const [validationError, setValidationError] = useState('')

  const minYear = 1900

  // Track if we have real user data
  useEffect(() => {
    // If user has data and we're in demo mode, exit demo mode
    if (hasData && isDemoMode) {
      setIsDemoMode(false)
    }
  }, [hasData, isDemoMode])

  const handleLoadDemo = () => {
    // Clear any existing data first
    localStorage.removeItem('salary-calculator-points')
    // Load demo data
    DEMO_PAY_POINTS.forEach(point => addPoint(point))
    setIsDemoMode(true)
  }

  const handleAddPoint = () => {
    const point: PayPoint = {
      year: Number(newYear),
      pay: Number(newPay.replace(/\s/g, '')),
    }

    const validation = validatePoint(point)
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || TEXT.forms.validation.invalidInput)
      return
    }

    // If adding real data while in demo mode, clear demo data first
    if (isDemoMode) {
      localStorage.removeItem('salary-calculator-points')
      setIsDemoMode(false)
      // Force a page reload to clear demo state
      window.location.reload()
      return
    }

    addPoint(point)
    // Clear form on successful addition
    setNewYear('')
    setNewPay('')
    setValidationError('')
  }

  const handleEditPoint = (point: PayPoint) => {
    // Pre-fill the form with the selected point's data
    setNewYear(String(point.year))
    setNewPay(String(point.pay))
    setValidationError('')

    // Remove the point so user can edit and re-add it
    removePoint(point.year, point.pay)
  }

  const handleRemovePoint = (year: number, pay: number) => {
    if (confirm(TEXT.common.confirmDelete)) {
      removePoint(year, pay)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-base">{TEXT.common.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-base text-red-600">{TEXT.common.error}</p>
      </div>
    )
  }

  // Right panel content - reused for both desktop sidebar and mobile drawer
  const rightPanelContent = (
    <RightPanel
      newYear={newYear}
      newPay={newPay}
      currentYear={currentYear}
      minYear={minYear}
      validationError={validationError}
      isNetMode={isNetMode}
      payPoints={payPoints}
      inflationData={inflationData}
      onYearChange={setNewYear}
      onPayChange={setNewPay}
      onAdd={handleAddPoint}
      onEdit={handleEditPoint}
      onRemove={handleRemovePoint}
      isMobileDrawer={isDrawerOpen}
    />
  )

  return (
    <>
      <MobileBottomDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        dashboardContent={rightPanelContent}
        pointsCount={payPoints.length}
      />
      <DashboardLayout rightPanel={rightPanelContent}>
        {/* Main Dashboard Content */}
        <div className="flex min-h-full flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-[var(--text-main)] md:text-3xl">
              {TEXT.dashboard.annualOverview}
            </h1>
            <p className="text-sm text-[var(--text-muted)] md:mt-1">
              {TEXT.dashboard.annualOverviewSubtitle}
            </p>
          </div>

          {/* Metrics Grid */}
          {hasData ? (
            <>
              {isDemoMode && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[24px] text-blue-600">
                      info
                    </span>
                    <p className="text-sm text-blue-900">{TEXT.onboarding.demoDataInfo}</p>
                  </div>
                </div>
              )}
              {/* Compact mobile summary */}
              <div className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] md:hidden">
                <button
                  onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
                  className="flex w-full items-center justify-between px-4 py-3"
                >
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex-1">
                      <p className="text-[10px] font-medium text-[var(--text-muted)]">
                        {isNetMode
                          ? TEXT.metrics.totalAnnualNetSalary
                          : TEXT.metrics.totalAnnualSalary}
                      </p>
                      <p className="text-lg font-bold text-[var(--text-main)]">
                        {Math.round(
                          isNetMode
                            ? calculateNetIncome(statistics.latestYear, statistics.latestPay)
                            : statistics.latestPay,
                        ).toLocaleString('nb-NO')}
                      </p>
                    </div>
                    <div className="flex-1 border-l border-[var(--border-light)] pl-4">
                      <p className="text-[10px] font-medium text-[var(--text-muted)]">
                        {TEXT.metrics.vsInflation}
                      </p>
                      <p
                        className={`text-lg font-bold ${statistics.gapPercent >= 0 ? 'text-[#078838]' : 'text-red-600'}`}
                      >
                        {statistics.gapPercent >= 0 ? '+' : ''}
                        {statistics.gapPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined ml-2 text-[20px] text-[var(--text-muted)]">
                    {isMetricsExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {isMetricsExpanded && (
                  <div className="border-t border-[var(--border-light)] px-4 py-3">
                    <div className="flex flex-col gap-3">
                      {/* Real Annual Value */}
                      <div>
                        <p className="text-[10px] font-medium text-[var(--text-muted)]">
                          {TEXT.metrics.realAnnualValue}
                        </p>
                        <p className="text-base font-bold text-[var(--text-main)]">
                          {Math.round(
                            isNetMode
                              ? calculateNetIncome(
                                  statistics.latestYear,
                                  statistics.inflationAdjustedPay,
                                )
                              : statistics.inflationAdjustedPay,
                          ).toLocaleString('nb-NO')}{' '}
                          {TEXT.common.pts}
                        </p>
                      </div>

                      {/* Yearly Change */}
                      <div>
                        <p className="text-[10px] font-medium text-[var(--text-muted)]">
                          {TEXT.metrics.yearlyChange}
                        </p>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-base font-bold ${statistics.gapPercent >= 0 ? 'text-[#078838]' : 'text-red-600'}`}
                          >
                            {statistics.gapPercent >= 0 ? '+' : ''}
                            {statistics.gapPercent.toFixed(1)}%
                          </p>
                          <span className="text-xs text-[var(--text-muted)]">
                            ({statistics.gapPercent >= 0 ? '+' : ''}
                            {Math.round(
                              isNetMode
                                ? calculateNetIncome(statistics.latestYear, statistics.latestPay) -
                                    calculateNetIncome(
                                      statistics.latestYear,
                                      statistics.inflationAdjustedPay,
                                    )
                                : statistics.latestPay - statistics.inflationAdjustedPay,
                            ).toLocaleString('nb-NO')}{' '}
                            {TEXT.common.pts})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Full metrics grid - desktop only */}
              <div className="hidden md:block">
                <MetricGrid statistics={statistics} isNetMode={isNetMode} />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] p-6 text-center">
              <p className="text-[var(--text-muted)]">{TEXT.dashboard.addDataPrompt}</p>
            </div>
          )}

          {/* Chart Section */}
          {hasData ? (
            <div className="flex min-h-[350px] flex-1">
              <ChartSection
                payPoints={payPoints}
                inflationData={inflationData}
                isNetMode={isNetMode}
                onToggleMode={toggleMode}
              />
            </div>
          ) : (
            <OnboardingEmptyState onLoadDemo={handleLoadDemo} />
          )}
        </div>
      </DashboardLayout>
    </>
  )
}
