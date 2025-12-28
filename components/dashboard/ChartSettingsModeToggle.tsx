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
      className="flex items-center justify-between gap-4 border-b border-[var(--border-light)] p-4"
      data-testid={testId('container')}
    >
      <div>
        <div className="text-sm font-semibold text-[var(--text-main)]">
          {TEXT.settings.grossNetToggleTitle}
        </div>
        <div className="mt-0.5 text-xs text-[var(--text-muted)]">
          {isNetMode
            ? TEXT.settings.grossNetToggleSubtitleNet
            : TEXT.settings.grossNetToggleSubtitleGross}
        </div>
      </div>
      <input
        type="checkbox"
        checked={isNetMode}
        onChange={onToggleMode}
        className="relative h-6 w-11 cursor-pointer appearance-none rounded-full bg-[var(--surface-subtle)] transition before:absolute before:top-0.5 before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-[var(--surface-light)] before:shadow before:transition before:content-[''] checked:bg-[var(--primary)] checked:before:translate-x-5 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--surface-light)]"
        aria-label={TEXT.settings.grossNetToggleTitle}
        data-testid={testId('toggle')}
      />
    </div>
  )
}
