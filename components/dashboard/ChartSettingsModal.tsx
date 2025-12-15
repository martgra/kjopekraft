import { TEXT } from '@/lib/constants/text'
import { type OccupationKey } from '@/features/referenceSalary/occupations'
import { createTestId } from '@/lib/testing/testIds'
import { ChartSettingsModeToggle } from './ChartSettingsModeToggle'
import { ChartSettingsBaselines } from './ChartSettingsBaselines'
import { ChartSettingsReference } from './ChartSettingsReference'

interface ChartSettingsModalProps {
  isOpen: boolean
  isNetMode: boolean
  showEventBaselines: boolean
  hasReferenceSeries: boolean
  selectedOccupation: OccupationKey | 'none'
  onToggleMode: () => void
  onToggleEventBaselines: (next: boolean) => void
  onOccupationChange: (value: string) => void
  onClose: () => void
}

export function ChartSettingsModal({
  isOpen,
  isNetMode,
  showEventBaselines,
  hasReferenceSeries,
  selectedOccupation,
  onToggleMode,
  onToggleEventBaselines,
  onOccupationChange,
  onClose,
}: ChartSettingsModalProps) {
  if (!isOpen) return null

  const testId = createTestId('chart-settings-modal')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl md:p-6"
        data-testid={testId('container')}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--primary)]">tune</span>
            <h3 className="text-base font-bold text-[var(--text-main)]">
              {TEXT.common.settings ?? 'Innstillinger'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--color-gray-50)]"
            aria-label={TEXT.common.close}
            data-testid={testId('close')}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <ChartSettingsModeToggle isNetMode={isNetMode} onToggleMode={onToggleMode} />
          <ChartSettingsBaselines
            showEventBaselines={showEventBaselines}
            onToggleEventBaselines={onToggleEventBaselines}
          />
          <ChartSettingsReference
            selectedOccupation={selectedOccupation}
            hasReferenceSeries={hasReferenceSeries}
            onOccupationChange={onOccupationChange}
          />
        </div>
      </div>
    </div>
  )
}
