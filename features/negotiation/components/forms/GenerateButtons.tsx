'use client'

import { AILoadingState, Icon } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'

export interface GenerateButtonsProps {
  pointsCount: number
  isGeneratingEmail: boolean
  emailRemaining: number
  hasReachedEmailLimit: boolean
  onGenerateEmail: () => void
  emailError?: string | null
}

export function GenerateButtons({
  pointsCount: _pointsCount,
  isGeneratingEmail,
  emailRemaining,
  hasReachedEmailLimit,
  onGenerateEmail,
  emailError,
}: GenerateButtonsProps) {
  return (
    <div className="flex-shrink-0 border-t border-[var(--border-light)] bg-[var(--surface-light)] p-3">
      {/* Warning Messages - Only show errors, hide tips to save space */}
      {emailError && (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-1.5 text-xs text-red-700">
          <Icon name="error" size="sm" />
          <span className="flex-1 truncate">{emailError}</span>
        </div>
      )}

      {/* Generate Buttons */}
      <div className="grid grid-cols-1 gap-2">
        <button
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg bg-green-200 px-2 py-2.5 font-semibold text-green-900 shadow-sm transition-all hover:bg-green-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onGenerateEmail}
          disabled={isGeneratingEmail || hasReachedEmailLimit}
        >
          <>
            <span className="flex items-center gap-1.5 text-sm">
              <Icon name="mail" size="sm" />
              {isGeneratingEmail ? TEXT.negotiation.generating : TEXT.negotiation.emailButton}
            </span>
            <span className="text-[9px] font-normal opacity-70">
              {emailRemaining} {TEXT.negotiation.remaining}
            </span>
          </>
        </button>
        {isGeneratingEmail && (
          <div className="mt-1 flex min-w-0">
            <AILoadingState
              size="sm"
              className="gap-1.5 truncate text-[11px] text-[var(--text-muted)] italic"
              spinnerClassName="border-[var(--primary)] border-t-transparent"
            />
          </div>
        )}
      </div>
    </div>
  )
}
