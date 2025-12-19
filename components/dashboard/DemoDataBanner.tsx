import { TEXT } from '@/lib/constants/text'
import { createTestId } from '@/lib/testing/testIds'

interface DemoDataBannerProps {
  onUseOwnData: () => void
}

export default function DemoDataBanner({ onUseOwnData }: DemoDataBannerProps) {
  const testId = createTestId('dashboard-demo-banner')

  return (
    <div
      className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm"
      data-testid={testId('container')}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[24px] text-blue-600">info</span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-900">{TEXT.onboarding.demoDataTitle}</p>
            <p className="text-sm text-blue-900">{TEXT.onboarding.demoDataInfo}</p>
          </div>
        </div>
        <button
          onClick={onUseOwnData}
          className="w-fit rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
          data-testid={testId('use-own-data-button')}
        >
          {TEXT.onboarding.demoDataCta}
        </button>
      </div>
    </div>
  )
}
