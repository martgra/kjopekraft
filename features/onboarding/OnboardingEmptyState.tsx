'use client'

import { Button } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'

interface OnboardingEmptyStateProps {
  onOpenDrawer: () => void
}

export default function OnboardingEmptyState({ onOpenDrawer }: OnboardingEmptyStateProps) {
  const handleAddOwnData = () => {
    // On mobile, open the drawer. On desktop, scroll to the form in the sidebar
    if (window.innerWidth < 768) {
      onOpenDrawer()
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[var(--border-light)] bg-gradient-to-b from-[var(--surface-light)] to-[var(--color-green-100)]/30 p-6 sm:p-8">
      {/* Logo with decorative background */}
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-[var(--color-green-100)]/50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
          <span className="text-[48px]" role="img" aria-label="Money with wings">
            💸
          </span>
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
      <div className="mb-8 flex flex-col items-center gap-4">
        <Button onClick={handleAddOwnData} variant="primary" icon="add" className="min-w-[200px]">
          {TEXT.onboarding.primaryCta}
        </Button>
      </div>

      {/* Info box - hidden on mobile */}
      <div className="hidden w-full max-w-lg rounded-lg border border-[var(--color-green-100)] bg-[var(--color-green-100)]/50 p-4 md:block">
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
