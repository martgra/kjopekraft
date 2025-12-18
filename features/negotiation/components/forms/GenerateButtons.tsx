'use client'

import { Icon, Spinner } from '@/components/ui/atoms'
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
  pointsCount,
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
          {isGeneratingEmail ? (
            <span className="flex items-center gap-1.5 text-sm">
              <Spinner size="sm" className="border-green-900 border-t-transparent" />
              {TEXT.negotiation.generating}
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-sm">
                <Icon name="mail" size="sm" />
                {TEXT.negotiation.emailButton}
              </span>
              <span className="text-[9px] font-normal opacity-70">
                {emailRemaining} {TEXT.negotiation.remaining}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
