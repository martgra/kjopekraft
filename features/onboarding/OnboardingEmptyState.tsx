'use client'

import { Button } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'

interface OnboardingEmptyStateProps {
  onLoadDemo: () => void
}

export default function OnboardingEmptyState({ onLoadDemo }: OnboardingEmptyStateProps) {
  const scrollToForm = () => {
    // Scroll to the right panel where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] p-8">
      <span className="material-symbols-outlined mb-4 text-[64px] text-[var(--primary)]">
        play_circle
      </span>
      <h2 className="mb-2 text-2xl font-bold text-[var(--text-main)]">
        {TEXT.onboarding.welcomeTitle}
      </h2>
      <p className="mb-6 max-w-md text-center text-base text-[var(--text-muted)]">
        {TEXT.onboarding.welcomeMessage}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={onLoadDemo} variant="primary">
          {TEXT.onboarding.loadDemoButton}
        </Button>
        <Button onClick={scrollToForm} variant="secondary">
          {TEXT.onboarding.addOwnDataButton}
        </Button>
      </div>

      <div className="mt-8 max-w-lg rounded-lg border border-[var(--border-light)] bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[24px] text-[var(--primary)]">info</span>
          <div>
            <h3 className="mb-1 text-sm font-semibold text-[var(--text-main)]">
              {TEXT.onboarding.whatIsKjopekraft}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              {TEXT.onboarding.kjopekraftExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
