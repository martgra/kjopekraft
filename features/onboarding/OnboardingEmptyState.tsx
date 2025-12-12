'use client'

import { Button } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'

interface OnboardingEmptyStateProps {
  onLoadDemo: () => void
}

const FEATURES = [
  {
    icon: 'trending_up',
    title: 'Spor lønnsutvikling',
    description: 'Se hvordan lønnen din har utviklet seg over tid',
  },
  {
    icon: 'analytics',
    title: 'Sammenlign med inflasjon',
    description: 'Forstå din reelle kjøpekraft',
  },
  {
    icon: 'handshake',
    title: 'Forhandle smartere',
    description: 'Få innsikt til lønnsforhandlinger',
  },
]

export default function OnboardingEmptyState({ onLoadDemo }: OnboardingEmptyStateProps) {
  const scrollToForm = () => {
    // Scroll to the right panel where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[var(--border-light)] bg-gradient-to-b from-[var(--surface-light)] to-blue-50/30 p-6 sm:p-8">
      {/* Icon with decorative background */}
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-blue-100/50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-600">
          <span className="material-symbols-outlined text-[40px] text-white">insights</span>
        </div>
      </div>

      {/* Welcome text */}
      <h2 className="mb-2 text-center text-2xl font-bold text-[var(--text-main)] sm:text-3xl">
        {TEXT.onboarding.welcomeTitle}
      </h2>
      <p className="mb-8 max-w-md text-center text-sm text-[var(--text-muted)] sm:text-base">
        {TEXT.onboarding.welcomeMessage}
      </p>

      {/* Action buttons */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button onClick={onLoadDemo} variant="primary" icon="play_arrow" className="min-w-[180px]">
          {TEXT.onboarding.loadDemoButton}
        </Button>
        <Button onClick={scrollToForm} variant="secondary" icon="add" className="min-w-[180px]">
          {TEXT.onboarding.addOwnDataButton}
        </Button>
      </div>

      {/* Feature preview cards */}
      <div className="mb-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {FEATURES.map((feature, index) => (
          <div
            key={index}
            className="flex flex-row items-center gap-3 rounded-lg border border-[var(--border-light)] bg-white p-3 sm:flex-col sm:items-start sm:p-4"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 sm:mb-2">
              <span className="material-symbols-outlined text-[24px] text-[var(--primary)]">
                {feature.icon}
              </span>
            </div>
            <div className="flex-1 sm:flex-none">
              <h3 className="text-sm font-semibold text-[var(--text-main)]">{feature.title}</h3>
              <p className="text-xs text-[var(--text-muted)]">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="w-full max-w-lg rounded-lg border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined flex-shrink-0 text-[24px] text-[var(--primary)]">
            lightbulb
          </span>
          <div>
            <h3 className="mb-1 text-sm font-semibold text-[var(--text-main)]">
              {TEXT.onboarding.whatIsKjopekraft}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              {TEXT.onboarding.kjopekraftExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
