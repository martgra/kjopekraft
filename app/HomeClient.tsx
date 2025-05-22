'use client'

import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'
import { useState, useEffect } from 'react'
import SalaryStats from '@/features/salary/components/SalaryStats'
import SalaryDashboard from '@/features/salary/components/SalaryDashboard.client'
import DataEntryGuide from '@/features/onboarding/components/DataEntryGuide.client'
import NegotiationTab from '@/features/negotiation/components/NegotiationTab.client'
import { TEXT } from '@/lib/constants/text'
import type { InflationDataPoint } from '@/lib/models/inflation'
import type { PayPoint } from '@/lib/models/types'
import { TabBar } from '@/components/ui/common/TabBar'

interface HomeClientProps {
  inflationData: InflationDataPoint[]
}

function OnboardingOverlay({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {/* Fade the background layout */}
      <div
        className="bg-opacity-60 absolute inset-0 bg-white transition-opacity"
        aria-hidden="true"
      />
      {/* Overlay in focus */}
      <div className="pointer-events-auto relative z-10 w-full max-w-md rounded-lg border border-blue-200 bg-white p-6 shadow-2xl">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Lukk"
        >
          ×
        </button>
        <h2 className="mb-2 text-xl font-bold">Velkommen!</h2>
        <div className="space-y-4">
          {text.split('\n\n').map((t, i) => (
            <p key={i} className="whitespace-pre-line text-gray-700">
              {t}
            </p>
          ))}
        </div>
        <button
          className="mt-6 w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          onClick={onClose}
        >
          Kom i gang
        </button>
      </div>
    </div>
  )
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

  const [activeTab, setActiveTab] = useState<'chart' | 'edit' | 'negotiation'>('chart')
  const [initialTabSet, setInitialTabSet] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Wrapper functions to match DataEntryGuide's expected types
  const handleAddPoint = (point: PayPoint) => {
    addPoint(point)
    return validatePoint(point)
  }

  const handleEditPoint = (oldPoint: PayPoint, newPoint: PayPoint) => {
    editPoint(oldPoint.year, oldPoint.pay, newPoint)
    return validatePoint(newPoint)
  }

  // On mount, restore last tab if present
  useEffect(() => {
    if (!initialTabSet && !isLoading) {
      let lastTab: 'chart' | 'edit' | 'negotiation' | null = null
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('salary-last-tab')
        if (stored === 'chart' || stored === 'edit' || stored === 'negotiation') {
          lastTab = stored
        }
      }
      setActiveTab(lastTab || (payPoints.length >= 2 ? 'chart' : 'edit'))
      setInitialTabSet(true)
    }
  }, [initialTabSet, payPoints.length, isLoading])

  // Persist last tab on change
  useEffect(() => {
    if (typeof window !== 'undefined' && initialTabSet) {
      localStorage.setItem('salary-last-tab', activeTab)
    }
  }, [activeTab, initialTabSet])

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('salary-onboarding-v1')) {
      setShowOnboarding(true)
    }
  }, [])

  const handleCloseOnboarding = () => {
    setShowOnboarding(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('salary-onboarding-v1', '1')
    }
  }

  // Uncomment this function if needed in the future
  // const handleResetOnboarding = () => {
  //   if (typeof window !== 'undefined') {
  //     localStorage.removeItem('salary-onboarding-v1')
  //     setShowOnboarding(true)
  //   }
  // }

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
    { key: 'negotiation', label: <>🤝 Forhandling</> },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:space-y-12 sm:px-6 lg:px-8">
      {showOnboarding && (
        <OnboardingOverlay
          text={`${TEXT.charts.tabGuide}\n\n${TEXT.forms.tabGuide}\n\n${TEXT.negotiation.tabGuide}`}
          onClose={handleCloseOnboarding}
        />
      )}
      <header className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-6xl">
          {TEXT.dashboard.title}
        </h1>
      </header>

      <div className="w-full">
        <SalaryStats {...displayStats} />
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[300px] items-center">
          <TabBar
            tabs={tabs.filter(tab => tab.key !== 'reset')}
            active={activeTab}
            onChange={k => setActiveTab(k as 'chart' | 'edit' | 'negotiation')}
          />
        </div>
      </div>

      <div className="w-full">
        {/* Remove inline tab guidance, now handled by onboarding overlay */}
        {activeTab === 'chart' ? (
          <SalaryDashboard
            payPoints={payPoints}
            inflationData={inflationData}
            displayNet={isNetMode}
            onToggleDisplay={toggleMode}
          />
        ) : activeTab === 'edit' ? (
          <DataEntryGuide
            payPoints={payPoints}
            onAdd={handleAddPoint}
            onRemove={pt => removePoint(pt.year, pt.pay)}
            onEdit={handleEditPoint}
            validatePoint={validatePoint}
            inflationData={inflationData}
          />
        ) : (
          <NegotiationTab salaryData={statistics} inflationData={inflationData} />
        )}
      </div>
    </div>
  )
}
