import { cn } from '@/lib/utils/cn'
import { createTestId } from '@/lib/testing/testIds'
import type { ViewMode } from '@/lib/searchParams'

interface ViewOption {
  value: ViewMode
  label: string
  description: string
}

interface ChartViewSwitcherProps {
  viewMode: ViewMode
  options: ViewOption[]
  onChange: (mode: ViewMode) => void
}

export function ChartViewSwitcher({ viewMode, options, onChange }: ChartViewSwitcherProps) {
  const testId = createTestId('chart-view-switcher')

  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-xl border border-[var(--border-light)]/70 bg-[var(--color-gray-50)] p-1 md:inline-flex md:w-fit md:gap-0 dark:bg-white/5"
      data-testid={testId('container')}
    >
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          className={cn(
            'w-full rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition md:w-auto md:px-3 md:py-1.5',
            viewMode === option.value
              ? 'bg-white text-[var(--text-main)] shadow-sm dark:bg-slate-700'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]',
          )}
          aria-pressed={viewMode === option.value}
          onClick={() => onChange(option.value)}
          data-testid={testId(['option', option.value])}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
