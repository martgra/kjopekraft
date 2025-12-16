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
    <div className="flex items-center justify-between gap-4 p-4" data-testid={testId('container')}>
      <div>
        <div className="text-sm font-semibold text-[var(--text-main)]">
          {TEXT.settings.eventBaselinesTitle}
        </div>
        <div className="mt-0.5 text-xs text-[var(--text-muted)]">
          {TEXT.settings.eventBaselinesSubtitle}
        </div>
      </div>
      <input
        type="checkbox"
        checked={showEventBaselines}
        onChange={e => onToggleEventBaselines(e.target.checked)}
        className="relative h-6 w-11 cursor-pointer appearance-none rounded-full bg-gray-200 transition before:absolute before:top-0.5 before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition before:content-[''] checked:bg-[var(--primary)] checked:before:translate-x-5 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
        aria-label={TEXT.settings.eventBaselinesTitle}
        data-testid="chart-event-baselines-toggle"
      />
    </div>
  )
}
