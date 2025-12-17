import { Select, SelectOption } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import { OCCUPATIONS, type OccupationKey } from '@/features/referenceSalary/occupations'
import { createTestId } from '@/lib/testing/testIds'

interface ChartSettingsReferenceProps {
  selectedOccupation: OccupationKey | 'none'
  onOccupationChange: (value: string) => void
}

export function ChartSettingsReference({
  selectedOccupation,
  onOccupationChange,
}: ChartSettingsReferenceProps) {
  const testId = createTestId('chart-settings-reference')

  return (
    <div
      className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
      data-testid={testId('container')}
    >
      <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">
        {TEXT.settings.occupationLabel}
      </label>
      <Select
        id="reference-occupation"
        aria-label={TEXT.settings.occupationLabel}
        value={selectedOccupation}
        onChange={onOccupationChange}
        className="text-sm"
        dataTestId="chart-settings-modal-occupation-select"
      >
        {Object.entries(OCCUPATIONS).map(([key, occupation]) => {
          const isStortinget =
            (occupation as unknown as { provider?: string }).provider === 'stortinget'
          return (
            <SelectOption key={key} value={key}>
              {occupation.label}
              {isStortinget ? '' : ` (${TEXT.charts.averageLabel})`}
            </SelectOption>
          )
        })}
        <SelectOption value="none">{TEXT.charts.noReference}</SelectOption>
      </Select>

      <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
        {TEXT.settings.occupationHelp}
      </p>
    </div>
  )
}
