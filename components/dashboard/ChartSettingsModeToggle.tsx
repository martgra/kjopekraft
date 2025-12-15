import { Toggle } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import { createTestId } from '@/lib/testing/testIds'

interface ChartSettingsModeToggleProps {
  isNetMode: boolean
  onToggleMode: () => void
}

export function ChartSettingsModeToggle({ isNetMode, onToggleMode }: ChartSettingsModeToggleProps) {
  const testId = createTestId('chart-settings-mode')

  return (
    <div
      className="flex items-center justify-between rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] px-3 py-2.5"
      data-testid={testId('container')}
    >
      <div>
        <p className="text-sm font-semibold text-[var(--text-main)]">
          {TEXT.charts.modeBadgeGross} / {TEXT.charts.modeBadgeNet}
        </p>
        <p className="text-xs text-[var(--text-muted)]">{TEXT.views.analysisDescription}</p>
      </div>
      <Toggle
        checked={isNetMode}
        onChange={onToggleMode}
        label={isNetMode ? TEXT.charts.modeBadgeNet : TEXT.charts.modeBadgeGross}
        className="scale-90 md:scale-100"
        labelClassName="min-w-[110px] text-center whitespace-nowrap text-[11px] md:text-xs"
        dataTestId={testId('toggle')}
      />
    </div>
  )
}
