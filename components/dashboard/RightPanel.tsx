'use client'

import { useState, useEffect } from 'react'
import SalaryPointForm from './SalaryPointForm'
import ActivityTimeline from './ActivityTimeline'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import { TEXT } from '@/lib/constants/text'

interface RightPanelProps {
  newYear: string
  newPay: string
  newReason: PayPoint['reason'] | ''
  currentYear: number
  minYear: number
  validationError?: string
  isNetMode?: boolean
  payPoints: PayPoint[]
  inflationData?: InflationDataPoint[]
  onYearChange: (yearStr: string) => void
  onPayChange: (payStr: string) => void
  onReasonChange: (reason: PayPoint['reason'] | '') => void
  onAdd: () => void
  onEdit?: (point: PayPoint) => void
  onRemove?: (year: number, pay: number) => void
  isMobileDrawer?: boolean
}

export default function RightPanel({
  newYear,
  newPay,
  newReason,
  currentYear,
  minYear,
  validationError,
  isNetMode,
  payPoints,
  inflationData,
  onYearChange,
  onPayChange,
  onReasonChange,
  onAdd,
  onEdit,
  onRemove,
  isMobileDrawer = false,
}: RightPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Collapse on mobile by default (only when NOT in drawer), expand on desktop
  useEffect(() => {
    const checkMobile = () => {
      // If in drawer, always show content
      if (isMobileDrawer) {
        setIsCollapsed(false)
      } else {
        setIsCollapsed(window.innerWidth < 1024)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isMobileDrawer])

  // If rendering in mobile drawer, skip the collapsible wrapper
  if (isMobileDrawer) {
    return (
      <div className="flex h-full flex-col">
        <SalaryPointForm
          newYear={newYear}
          newPay={newPay}
          newReason={newReason}
          currentYear={currentYear}
          minYear={minYear}
          validationError={validationError}
          isNetMode={isNetMode}
          payPoints={payPoints}
          inflationData={inflationData}
          onYearChange={onYearChange}
          onPayChange={onPayChange}
          onReasonChange={onReasonChange}
          onAdd={onAdd}
        />
        <ActivityTimeline
          payPoints={payPoints}
          onEdit={onEdit}
          onRemove={onRemove}
          currentYear={currentYear}
          variant={isMobileDrawer ? 'drawer' : 'sidebar'}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Collapsible toggle button - only visible on mobile */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex w-full items-center justify-between border-b border-[var(--border-light)] bg-gray-50/50 p-4 text-sm font-semibold text-[var(--text-main)] transition-colors hover:bg-gray-100 lg:hidden"
        aria-expanded={!isCollapsed}
        aria-controls="right-panel-content"
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--primary)]">
            {isCollapsed ? 'expand_more' : 'expand_less'}
          </span>
          {isCollapsed ? TEXT.dashboard.showDataEntry : TEXT.dashboard.hideDataEntry}
        </span>
        {payPoints.length > 0 && (
          <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs text-white">
            {payPoints.length}
          </span>
        )}
      </button>

      {/* Collapsible content */}
      <div
        id="right-panel-content"
        className={`transition-all duration-300 ease-in-out lg:block ${
          isCollapsed ? 'hidden' : 'block'
        }`}
      >
        <SalaryPointForm
          newYear={newYear}
          newPay={newPay}
          newReason={newReason}
          currentYear={currentYear}
          minYear={minYear}
          validationError={validationError}
          isNetMode={isNetMode}
          payPoints={payPoints}
          inflationData={inflationData}
          onYearChange={onYearChange}
          onPayChange={onPayChange}
          onReasonChange={onReasonChange}
          onAdd={onAdd}
        />
        <ActivityTimeline
          payPoints={payPoints}
          onEdit={onEdit}
          onRemove={onRemove}
          currentYear={currentYear}
          variant={isMobileDrawer ? 'drawer' : 'sidebar'}
        />
      </div>
    </div>
  )
}
