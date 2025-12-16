import { TEXT } from '@/lib/constants/text'
import { createTestId } from '@/lib/testing/testIds'

interface DemoDataBannerProps {
  onClearDemo: () => void
}

export default function DemoDataBanner({ onClearDemo }: DemoDataBannerProps) {
  const testId = createTestId('dashboard-demo-banner')

  return (
    <div
      className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50"
      data-testid={testId('container')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[24px] text-blue-600 dark:text-blue-400">
            info
          </span>
          <p className="text-sm text-blue-900 dark:text-blue-100">{TEXT.onboarding.demoDataInfo}</p>
        </div>
        <button
          onClick={onClearDemo}
          className="shrink-0 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900"
          data-testid={testId('clear-button')}
        >
          {TEXT.onboarding.clearDemoData}
        </button>
      </div>
    </div>
  )
}
