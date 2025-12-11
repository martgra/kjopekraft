'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MetricGrid from './MetricGrid'
import ChartSection from './ChartSection'
import RightPanel from './RightPanel'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'
import type { InflationDataPoint } from '@/lib/models/inflation'
import type { PayPoint } from '@/lib/models/types'
import { TEXT } from '@/lib/constants/text'

interface DashboardProps {
  inflationData: InflationDataPoint[]
}

export default function Dashboard({ inflationData }: DashboardProps) {
  const { payPoints, statistics, hasData, addPoint, validatePoint, isLoading, error } =
    useSalaryData(inflationData)

  const { isNetMode, toggleMode } = useDisplayMode()

  // Form state
  const [newYear, setNewYear] = useState('')
  const [newPay, setNewPay] = useState('')
  const [validationError, setValidationError] = useState('')

  const currentYear = new Date().getFullYear()
  const minYear = 1900

  const handleAddPoint = () => {
    const point: PayPoint = {
      year: Number(newYear),
      pay: Number(newPay.replace(/\s/g, '')),
    }

    const validation = validatePoint(point)
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Invalid input')
      return
    }

    addPoint(point)
    // Clear form on successful addition
    setNewYear('')
    setNewPay('')
    setValidationError('')
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-base">Loading...</p>
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

  return (
    <DashboardLayout
      rightPanel={
        <RightPanel
          newYear={newYear}
          newPay={newPay}
          currentYear={currentYear}
          minYear={minYear}
          validationError={validationError}
          isNetMode={isNetMode}
          payPoints={payPoints}
          onYearChange={setNewYear}
          onPayChange={setNewPay}
          onAdd={handleAddPoint}
        />
      }
    >
      {/* Main Dashboard Content */}
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-main)] md:text-4xl">
              Annual Overview
            </h1>
            <p className="text-base text-[var(--text-muted)]">
              Here&apos;s your salary performance for the current year.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border-light)] bg-white px-3 py-2 shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-[var(--text-muted)]">
              calendar_month
            </span>
            <span className="text-sm font-medium text-[var(--text-main)]">
              Fiscal Year {currentYear}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        {hasData ? (
          <MetricGrid statistics={statistics} isNetMode={isNetMode} />
        ) : (
          <div className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] p-6 text-center">
            <p className="text-[var(--text-muted)]">
              Add your salary data to see metrics and charts
            </p>
          </div>
        )}

        {/* Chart Section */}
        {hasData ? (
          <ChartSection payPoints={payPoints} inflationData={inflationData} isNetMode={isNetMode} />
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] p-6">
            <span className="material-symbols-outlined mb-4 text-[64px] text-[var(--text-muted)]">
              insert_chart
            </span>
            <p className="text-lg font-medium text-[var(--text-muted)]">No data to display yet</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Add salary points using the form to see your growth chart
            </p>
          </div>
        )}

        {/* Display Mode Toggle */}
        <div className="flex items-center justify-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isNetMode}
              onChange={toggleMode}
              className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <span className="text-sm font-medium text-[var(--text-main)]">
              Show Net Salary (after tax)
            </span>
          </label>
        </div>
      </div>
    </DashboardLayout>
  )
}
