'use client'

import { Button, Icon, Spinner } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'

export interface GenerateButtonsProps {
  pointsCount: number
  // Email generation
  isGeneratingEmail: boolean
  emailRemaining: number
  hasReachedEmailLimit: boolean
  onGenerateEmail: () => void
  // Playbook generation
  isGeneratingPlaybook: boolean
  playbookRemaining: number
  hasReachedPlaybookLimit: boolean
  onGeneratePlaybook: () => void
  // Errors
  emailError?: string | null
  playbookError?: string | null
}

export function GenerateButtons({
  pointsCount,
  isGeneratingEmail,
  emailRemaining,
  hasReachedEmailLimit,
  onGenerateEmail,
  isGeneratingPlaybook,
  playbookRemaining,
  hasReachedPlaybookLimit,
  onGeneratePlaybook,
  emailError,
  playbookError,
}: GenerateButtonsProps) {
  return (
    <div className="flex-shrink-0 space-y-2 border-t border-gray-200 bg-white p-3">
      {/* Warning Messages */}
      {pointsCount === 0 && (
        <div className="flex items-center gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
          <Icon name="info" size="sm" />
          <span className="flex-1 truncate">{TEXT.negotiation.minPointsWarning}</span>
        </div>
      )}
      {pointsCount > 0 && pointsCount < 3 && (
        <div className="flex items-center gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
          <Icon name="info" size="sm" />
          <span className="flex-1 truncate">{TEXT.negotiation.suggestionMorePoints}</span>
        </div>
      )}
      {(emailError || playbookError) && (
        <div className="flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-1.5 text-xs text-red-700">
          <Icon name="error" size="sm" />
          <span className="flex-1 truncate">{emailError || playbookError}</span>
        </div>
      )}

      {/* Generate Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg bg-green-200 px-2 py-2.5 font-semibold text-green-900 shadow-sm transition-all hover:bg-green-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onGenerateEmail}
          disabled={isGeneratingEmail || hasReachedEmailLimit || pointsCount === 0}
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

        <button
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg bg-purple-200 px-2 py-2.5 font-semibold text-purple-900 shadow-sm transition-all hover:bg-purple-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onGeneratePlaybook}
          disabled={isGeneratingPlaybook || hasReachedPlaybookLimit || pointsCount === 0}
        >
          {isGeneratingPlaybook ? (
            <span className="flex items-center gap-1.5 text-sm">
              <Spinner size="sm" className="border-purple-900 border-t-transparent" />
              {TEXT.negotiation.generating}
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-sm">
                <Icon name="menu_book" size="sm" />
                {TEXT.negotiation.playbookButton}
              </span>
              <span className="text-[9px] font-normal opacity-70">
                {playbookRemaining} {TEXT.negotiation.remaining}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
