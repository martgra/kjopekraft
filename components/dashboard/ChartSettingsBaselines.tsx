import { TEXT } from '@/lib/constants/text'
import { createTestId } from '@/lib/testing/testIds'

interface ChartSettingsBaselinesProps {
  showEventBaselines: boolean
  onToggleEventBaselines: (next: boolean) => void
}

export function ChartSettingsBaselines({
  showEventBaselines,
  onToggleEventBaselines,
}: ChartSettingsBaselinesProps) {
  const testId = createTestId('chart-settings-baselines')

  return (
    <div
      className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] px-3 py-3"
      data-testid={testId('container')}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text-main)]">
            {TEXT.charts.showEventBaselines}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Gjelder grafvisning; markerer hendelser som forfremmelser.
          </p>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            data-testid="chart-event-baselines-toggle"
            checked={showEventBaselines}
            onChange={e => onToggleEventBaselines(e.target.checked)}
            className="relative h-6 w-11 cursor-pointer appearance-none rounded-full bg-gray-200 transition before:absolute before:top-0.5 before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition before:content-[''] checked:bg-[var(--primary)] checked:before:translate-x-5 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            aria-label={TEXT.charts.showEventBaselines}
          />
        </label>
      </div>
    </div>
  )
}
