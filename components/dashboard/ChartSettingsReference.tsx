import { Select, SelectOption } from '@/components/ui/atoms'
import InfoTooltip from '@/components/ui/atoms/InfoTooltip'
import { TEXT } from '@/lib/constants/text'
import { OCCUPATIONS, type OccupationKey } from '@/features/referenceSalary/occupations'
import { createTestId } from '@/lib/testing/testIds'

interface ChartSettingsReferenceProps {
  selectedOccupation: OccupationKey | 'none'
  hasReferenceSeries: boolean
  onOccupationChange: (value: string) => void
}

export function ChartSettingsReference({
  selectedOccupation,
  hasReferenceSeries,
  onOccupationChange,
}: ChartSettingsReferenceProps) {
  const testId = createTestId('chart-settings-reference')

  return (
    <div
      className="space-y-2 rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-3"
      data-testid={testId('container')}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text-main)]">
            {TEXT.charts.compareWithOccupation}
          </span>
          <InfoTooltip label={TEXT.charts.referenceHelp} />
        </div>
        {hasReferenceSeries && (
          <span className="rounded-full bg-[var(--primary)]/10 px-2 py-1 text-[11px] font-semibold text-[var(--primary)]">
            {TEXT.charts.referenceEnabled}
          </span>
        )}
      </div>
      <Select
        id="reference-occupation"
        aria-label={TEXT.charts.compareWithOccupation}
        value={selectedOccupation}
        onChange={onOccupationChange}
        className="text-sm md:text-sm"
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
      <p className="text-xs text-[var(--text-muted)]">
        Velg referanselønn uavhengig av visning – brukes i graf, tabell og analyse.
      </p>
    </div>
  )
}
