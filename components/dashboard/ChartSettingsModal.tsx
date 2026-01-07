'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { TEXT } from '@/lib/constants/text'
import type { OccupationSelection } from '@/lib/ssb/occupationSelection'
import { createTestId } from '@/lib/testing/testIds'
import { Panel, ModalShell } from '@/components/ui/atoms'
import { ChartSettingsModeToggle } from './ChartSettingsModeToggle'
import { ChartSettingsInflationBase } from './ChartSettingsInflationBase'
import { ChartSettingsReference } from './ChartSettingsReference'

interface ChartSettingsModalProps {
  isOpen: boolean
  isNetMode: boolean
  inflationBaseValue: string
  inflationBaseOptions: { value: string; label: string }[]
  selectedOccupation: OccupationSelection | null
  referenceAlertMessage?: string
  referenceErrorMessage?: string | null
  onToggleMode: () => void
  onChangeInflationBase: (value: string) => void
  onOccupationChange: (value: OccupationSelection | null) => void
  onClose: () => void
}

export function ChartSettingsModal({
  isOpen,
  isNetMode,
  inflationBaseValue,
  inflationBaseOptions,
  selectedOccupation,
  referenceAlertMessage,
  referenceErrorMessage,
  onToggleMode,
  onChangeInflationBase,
  onOccupationChange,
  onClose,
}: ChartSettingsModalProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isOpen) return null

  const testId = createTestId('chart-settings-modal')

  const modal = (
    <ModalShell
      onClose={onClose}
      className="flex max-h-[700px] w-full max-w-[350px] animate-[fadeIn_0.2s_ease-out] flex-col"
      backdropClassName="bg-black/70"
      wrapperClassName="z-[80]"
      data-testid={testId('container')}
    >
      {/* Modal header */}
      <div className="flex items-center justify-between border-b border-[var(--border-light)] px-6 py-5">
        <h2 className="text-lg font-bold text-[var(--text-main)]">{TEXT.common.settings}</h2>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-subtle)]"
          aria-label={TEXT.common.close}
          data-testid={testId('close')}
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Modal content */}
      <div className="space-y-6 overflow-y-auto px-6 pt-5 pb-6">
        {/* Section: Visning (Display settings) */}
        <div>
          <div className="mb-3 pl-1 text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            {TEXT.settings.displaySection}
          </div>

          <Panel padding="none" className="overflow-hidden rounded-2xl">
            <ChartSettingsModeToggle isNetMode={isNetMode} onToggleMode={onToggleMode} />
            <ChartSettingsInflationBase
              value={inflationBaseValue}
              options={inflationBaseOptions}
              onChange={onChangeInflationBase}
            />
          </Panel>
        </div>

        {/* Section: Sammenligning (Comparison settings) */}
        <div>
          <div className="mb-3 pl-1 text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            {TEXT.settings.comparisonSection}
          </div>

          <ChartSettingsReference
            selectedOccupation={selectedOccupation}
            onOccupationChange={onOccupationChange}
            alertMessage={referenceAlertMessage}
            errorMessage={referenceErrorMessage}
          />
        </div>
      </div>
    </ModalShell>
  )

  if (!isMounted) return null

  return createPortal(modal, document.body)
}
