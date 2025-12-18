import { TEXT } from '@/lib/constants/text'
import type { ReferenceOccupationSelection } from '@/features/referenceSalary/occupations'
import { createTestId } from '@/lib/testing/testIds'
import { ChartSettingsModeToggle } from './ChartSettingsModeToggle'
import { ChartSettingsInflationBase } from './ChartSettingsInflationBase'
import { ChartSettingsReference } from './ChartSettingsReference'
import { ThemeToggle } from './ThemeToggle'

interface ChartSettingsModalProps {
  isOpen: boolean
  isNetMode: boolean
  inflationBaseValue: string
  inflationBaseOptions: { value: string; label: string }[]
  selectedOccupation: ReferenceOccupationSelection | null
  onToggleMode: () => void
  onChangeInflationBase: (value: string) => void
  onOccupationChange: (value: ReferenceOccupationSelection | null) => void
  onClose: () => void
}

export function ChartSettingsModal({
  isOpen,
  isNetMode,
  inflationBaseValue,
  inflationBaseOptions,
  selectedOccupation,
  onToggleMode,
  onChangeInflationBase,
  onOccupationChange,
  onClose,
}: ChartSettingsModalProps) {
  if (!isOpen) return null

  const testId = createTestId('chart-settings-modal')

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal positioning wrapper */}
      <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center px-4">
        {/* Modal card */}
        <div
          className="pointer-events-auto relative flex max-h-[700px] w-full max-w-[350px] animate-[fadeIn_0.2s_ease-out] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900"
          data-testid={testId('container')}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-700">
            <h2 className="text-lg font-bold text-[var(--text-main)]">{TEXT.common.settings}</h2>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
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

              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <ChartSettingsModeToggle isNetMode={isNetMode} onToggleMode={onToggleMode} />
                <ChartSettingsInflationBase
                  value={inflationBaseValue}
                  options={inflationBaseOptions}
                  onChange={onChangeInflationBase}
                />
                <ThemeToggle />
              </div>
            </div>

            {/* Section: Sammenligning (Comparison settings) */}
            <div>
              <div className="mb-3 pl-1 text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                {TEXT.settings.comparisonSection}
              </div>

              <ChartSettingsReference
                selectedOccupation={selectedOccupation}
                onOccupationChange={onOccupationChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
